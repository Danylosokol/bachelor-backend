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
  const currentTime = new Date(today);
  const startOfToday = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate()
  );
  console.log("Start of the day");
  console.log(startOfToday);
  const endOfToday = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate() + 1
  );
  console.log("End of the day");
  console.log(endOfToday);
  const currentWeekDay = new Date(today).getDay();
  return Card.find({
    $and: [
      {
        $or: [
          {
            type: "one-time",
            deadline: { $gte: startOfToday, $lt: endOfToday },
          },
          {
            type: "recurring",
            startDay: { $lt: endOfToday },
            pattern: currentWeekDay,
          },
        ]
      },
      { owners: { $in: [userId] } },
    ],
  }).exec();
};

const getAllUserCardsForNextDay = async (userId, today) => {
  const date = new Date(today);
  let targetDate = new Date(date);
  const dayOfWeek = date.getDay();

  // If today is Monday - Thursday, target date is tomorrow
  if (dayOfWeek !== 5) {
    targetDate.setDate(date.getDate() + 1);
  }
  // If today is Friday, target date is Monday
  else if (dayOfWeek === 5) {
    targetDate.setDate(date.getDate() + 3);
  }

  const startOfTargetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endOfTargetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate() + 1
  );

  return Card.find({
    $and: [
      {
        $or: [
          {
            type: "one-time",
            deadline: { $gte: startOfTargetDay, $lt: endOfTargetDay },
          },
          {
            type: "recurring",
            startDay: { $lt: endOfTargetDay },
            pattern: targetDate.getDay(),
          },
        ],
      },
      { owners: { $in: [userId] } },
    ],
  }).exec();
};

const getCurrentCardsAndFeedbacks = async (startDay, endDay, projectId) => {
  let cards = await Card.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                type: "one-time",
                deadline: { $gte: startDay, $lte: endDay },
              },
              {
                type: "recurring",
                startDay: { $lte: endDay },
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
                  date: { $gte: startDay, $lte: endDay },
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

const getPlanedProjectCards = async (endDay, projectId) => {
  return Card.find({
    $or: [
      {
        type: "one-time",
        deadline: { $gte: endDay },
        project: new mongoose.Types.ObjectId(projectId),
      },
      {
        type: "recurring",
        startDay: { $lt: endDay },
        project: new mongoose.Types.ObjectId(projectId),
      },
    ],
  }).exec();
};

const createCard = async (data) => {
  const card = new Card({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    description: data.description,
    project: data.project,
    links: [...data.links],
    templates: [...data.templates],
    startDay: data.startDay,
    deadline: data.deadline,
    type: data.type,
    pattern: [...data.pattern],
    owners: [...data.owners],
    createdBy: data.createdBy,
    organization: data.organization,
  });
  return card.save();
};

const updateCard = async (data) => {
  const updatedCard = {
    name: data.name,
    description: data.description,
    links: [...data.links],
    templates: [...data.templates],
    startDay: data.startDay,
    deadline: data.deadline,
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
