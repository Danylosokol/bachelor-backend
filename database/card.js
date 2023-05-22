require("dotenv").config();
const mongoose = require("mongoose");
let { Card } = require("../models/Card");

mongoose.set("strictQuery", false);
// Connects to the MongoDB database using the URI stored in the .env file "MONGO_URI"
// Additional options are provided to use the new URL string parser and the new server topology engine
// The database name is also specified
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

// Function to fetch all cards related to a project
const getAllProjectCards = async (projectId) => {
  return Card.find({ project: projectId })
    .populate({ path: "project" })
    .populate({ path: "owners" })
    .populate({ path: "createdBy" })
    .exec();
};

// Function to fetch all cards assigned to the current user for current day
const getAllCurrentUserCards = async (userId, today) => {
  const todayDate = new Date(today);
  const todayDateUTC = new Date(
    Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
  );
  // We need to know what day of the week is now, so we can check for recurring tasks if they can be assigned to the user at this specific day of the week
  const currentWeekDay = new Date(today).getDay();
  return Card.find({
    $and: [
      {
        $or: [
          {
            type: "one-time",
            startDate: { $lte: todayDateUTC },
            endDate: { $gte: todayDateUTC },
          },
          {
            type: "recurring",
            startDate: { $lte: todayDateUTC },
            endDate: { $gte: todayDateUTC },
            pattern: currentWeekDay,
          },
        ],
      },
      { owners: { $in: [userId] } },
    ],
  }).exec();
};

// Function to fetch all cards related to a user for the next day or after the weekend
const getAllUserCardsForNextDay = async (userId, today) => {
  const todayDate = new Date(today);
  const targetDateUTC = new Date(
    Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
  );

  const dayOfWeek = targetDateUTC.getDay();
  // If the current day is not Friday, set target date to next day
  if (dayOfWeek !== 5) {
    targetDateUTC.setUTCDate(targetDateUTC.getDate() + 1);
    // If the current day is Friday, set target date to Monday
  } else if (dayOfWeek === 5) {
    targetDateUTC.setUTCDate(targetDateUTC.getDate() + 3);
  }
  // Here as in the previous function we also make sure that recurring task has specified day of the week in the pattern
  return Card.find({
    $and: [
      {
        $or: [
          {
            type: "one-time",
            startDate: { $lte: targetDateUTC },
            endDate: { $gte: targetDateUTC },
          },
          {
            type: "recurring",
            startDate: { $lte: targetDateUTC },
            endDate: { $gte: targetDateUTC },
            pattern: targetDateUTC.getDay(),
          },
        ],
      },
      { owners: { $in: [userId] } },
    ],
  }).exec();
};

// Function to fetch all cards and related feedbacks for a specific time range and project to create later summarization of feedbacks for project report
const getCurrentCardsAndFeedbacks = async (startTimeStamp, endTimeStamp, projectId) => {
  // local dates to UTC dates
  const startDate = new Date(startTimeStamp);
  const startDateUTC = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const endDate = new Date(endTimeStamp);
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  startDateUTC.setUTCHours(0, 0, 0, 0);
  endDateUTC.setUTCHours(23, 0, 0, 0);
  // Get unique days of the week within the date range
  const uniqueDaysOfWeek = getUniqueDaysOfWeek(startDateUTC, endDateUTC);
  // Use aggregation framework (aggregate() function specifically) to match, filter and join documents across collections
  let cards = await Card.aggregate([
    {
      // Filter documents to include in the aggregation pipeline
      $match: {
        $and: [
          {
            $or: [
              {
                type: "one-time",
                startDate: { $lte: endDateUTC },
                endDate: { $gte: startDateUTC },
              },
              {
                type: "recurring",
                startDate: { $lte: endDateUTC },
                endDate: { $gte: startDateUTC },
                pattern: { $in: uniqueDaysOfWeek },
              },
            ],
          },
          { project: new mongoose.Types.ObjectId(projectId) },
        ],
      },
    },
    {
      // Perform a left outer join to another collection (personal-reports)
      $lookup: {
        from: "personal-reports",
        // Define variables to use in the pipeline field stages
        let: { cardId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  // Allow aggregation expressions within the query language
                  $expr: {
                    $in: [
                      { $toString: "$$cardId" },
                      // Convert feedbacks.card array to string
                      {
                        $map: {
                          input: "$feedbacks.card",
                          as: "card",
                          in: { $toString: "$$card" },
                        },
                      },
                    ],
                  },
                },
                {
                  date: { $gte: startDateUTC, $lte: endDateUTC },
                },
              ],
            },
          },
          {
            // Specify the fields to include in the returned documents
            $project: {
              user: 1,
              date: 1,
              feedbacks: {
                $filter: {
                  input: "$feedbacks",
                  as: "feedback",
                  // Specify condition to met
                  cond: {
                    $and: [
                      {
                        // Check if values are equal
                        $eq: [
                          { $toString: "$$cardId" },
                          { $toString: "$$feedback.card" },
                        ],
                      },
                      {
                        // Ensure feedback type is "current"
                        $eq: ["current", "$$feedback.type"],
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
        // Output documents put to the "personalReports" field
        as: "personalReports",
      },
    },
  ]).exec();
  // Populate fields ("createdBy", "owners", "personalReports.user") with documents from the User collection
  cards = await Card.populate(cards, {
    path: "createdBy owners personalReports.user",
    model: "User",
  });
  return [...cards];
};

// Function to fetch cards for specific project that are already planed for the future during generation of the project report
const getPlanedProjectCards = async (endTimeStamp, projectId) => {
  // endDate to UTC fromat and set it to the end of the day
  const endDate = new Date(endTimeStamp);
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  endDateUTC.setUTCHours(23, 0, 0, 0);
  // Return the project cards with an end date greater than the endDateUTC and matching the project ID.
  return Card.find({
    $or: [
      {
        endDate: { $gt: endDateUTC },
        project: new mongoose.Types.ObjectId(projectId),
      },
    ],
  }).exec();
};

// Function to create a card in the database
const createCard = async (data) => {
  // Converts the start date and end date provided in the data object into JavaScript date objects and convert them to UTC fromat
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const startDateUTC = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  // Sets the UTC hours, minutes, seconds, and milliseconds for the start and end dates
  startDateUTC.setUTCHours(0, 0, 0, 0);
  endDateUTC.setUTCHours(23, 0, 0, 0);
  // Creates a new Card object with the provided data
  const card = new Card({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    description: data.description,
    project: data.project,
    links: [...data.links],
    templates: [...data.templates],
    startDate: startDateUTC,
    endDate: endDateUTC,
    type: data.type,
    pattern: [...data.pattern],
    owners: [...data.owners],
    createdBy: data.createdBy,
    organization: data.organization,
  });
  // Saves the new Card object to the database and returns the saved Card object
  return card.save();
};

// Function to update object in the databse
const updateCard = async (data) => {
  // Converts the start date and end date provided in the data object into JavaScript date objects and convert them to UTC fromat
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const startDateUTC = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  startDateUTC.setUTCHours(0, 0, 0, 0);
  endDateUTC.setUTCHours(23, 0, 0, 0);
  // Creates an object with the updated data for the card
  const updatedCard = {
    name: data.name,
    description: data.description,
    links: [...data.links],
    templates: [...data.templates],
    startDate: startDateUTC,
    endDate: endDateUTC,
    type: data.type,
    pattern: [...data.pattern],
    owners: [...data.owners],
  };
  // Uses the findByIdAndUpdate method from Mongoose to update the card in the database. The { new: true } option in the method call is used to return the updated document rather than the original.
  return Card.findByIdAndUpdate(data._id, updatedCard, { new: true }).exec();
};

// Function find card by id in the database and delete it
const deleteCard = async (cardId) => {
  return Card.findByIdAndDelete(cardId).exec();
};

module.exports = {
  getAllProjectCards,
  getAllCurrentUserCards,
  getAllUserCardsForNextDay,
  getCurrentCardsAndFeedbacks,
  getPlanedProjectCards,
  createCard,
  updateCard,
  deleteCard,
};

// This function is used to get the unique days of the week between two dates
const getUniqueDaysOfWeek = (startDate, endDate) => {
  // Initialize a new Set to store the unique days of the week. Set is a built-in JavaScript object that only allows unique values.
  const daysOfWeek = new Set();
  let currentDate = new Date(startDate);
  endDate = new Date(endDate);
  while (currentDate <= endDate) {
    // Add the day of the week of the current date to the set. The getUTCDay() method is used to get the day of the week according to universal time. The day of the week is returned as a number between 0 (Sunday) and 6 (Saturday).
    daysOfWeek.add(currentDate.getUTCDay().toString());
    // Move on to the next date
    currentDate.setDate(currentDate.getDate() + 1);
  }
  // Convert the Set of unique days of the week back to an array before returning it
  return [...daysOfWeek];
}
