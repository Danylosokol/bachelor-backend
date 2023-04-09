require("dotenv").config();
const mongoose = require("mongoose");
let { Card } = require("../models/Card");
let { PersonalReport } = require("../models/PersonalReport");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getAllProjectCards = async (projectId) => {
  return Card.find({ project: projectId })
    .populate({ path: "project" })
    .populate({ path: "owners" })
    .populate({ path: "createdBy" })
    .exec();
};

const getAllCurrentUserCards = async (userId, today) => {
  const todayDate = new Date(today);
  const todayDateUTC = new Date(
    Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
  );
  console.log(todayDateUTC);
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

const getAllUserCardsForNextDay = async (userId, today) => {
  const todayDate = new Date(today);
  const targetDateUTC = new Date(
    Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
  );

  const dayOfWeek = targetDateUTC.getDay();

  if (dayOfWeek !== 5) {
   targetDateUTC.setUTCDate(targetDateUTC.getDate() + 1);
  }
  else if (dayOfWeek === 5) {
    targetDateUTC.setUTCDate(targetDateUTC.getDate() + 3);
  }

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

const getCurrentCardsAndFeedbacks = async (startTimeStamp, endTimeStamp, projectId) => {
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
  console.log(startDateUTC);
  console.log(endDateUTC);
  const uniqueDaysOfWeek = getUniqueDaysOfWeek(startDateUTC, endDateUTC);
  console.log("UNIQUE DAYS OF WEEK:");
  console.log(uniqueDaysOfWeek);
  let cards = await Card.aggregate([
    {
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
                pattern: {$in: uniqueDaysOfWeek}
              },
            ],
          },
          { project: new mongoose.Types.ObjectId(projectId) },
        ],
      },
    },
    {
      $lookup: {
        from: "personal-reports",
        let: { cardId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $in: [
                      { $toString: "$$cardId" },
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
            $project: {
              user: 1,
              date: 1,
              feedbacks: {
                $filter: {
                  input: "$feedbacks",
                  as: "feedback",
                  cond: {
                    $and: [
                      {
                        $eq: [
                          { $toString: "$$cardId" },
                          { $toString: "$$feedback.card" },
                        ],
                      },
                      {
                        $eq: ["current", "$$feedback.type"],
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
        as: "personalReports",
      },
    },
  ]).exec();
  cards = await Card.populate(cards, {
    path: "createdBy owners personalReports.user",
    model: "User",
  });
  return [...cards];
};

const getPlanedProjectCards = async (endTimeStamp, projectId) => {
  const endDate = new Date(endTimeStamp);
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  console.log(endDateUTC);
  endDateUTC.setUTCHours(23, 0, 0, 0);
  return Card.find({
    $or: [
      {
        endDate: { $gt: endDateUTC },
        project: new mongoose.Types.ObjectId(projectId),
      }
    ],
  }).exec();
};

const createCard = async (data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const startDateUTC = new Date(
    Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    )
  );
  const endDateUTC = new Date(
    Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    )
  );
  startDateUTC.setUTCHours(0, 0, 0, 0);
  endDateUTC.setUTCHours(23, 0, 0, 0);
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
  return card.save();
};

const updateCard = async (data) => {
  const startDate = new Date(data.startDate);
  console.log("Start day while updating:");
  console.log(data.startDate);
  const endDate = new Date(data.endDate);
  console.log("end date while updating:");
  console.log(data.endDate);
  const startDateUTC = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  startDateUTC.setUTCHours(0, 0, 0, 0);
  endDateUTC.setUTCHours(23, 0, 0, 0);
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
  return Card.findByIdAndUpdate(data._id, updatedCard, { new: true }).exec();
};

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

const getUniqueDaysOfWeek = (startDate, endDate) => {
  const daysOfWeek = new Set();
  let currentDate = new Date(startDate);
  endDate = new Date(endDate);
  while (currentDate <= endDate) {
    daysOfWeek.add(currentDate.getUTCDay().toString());
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return [...daysOfWeek];
}
