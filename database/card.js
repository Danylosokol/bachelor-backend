require("dotenv").config();
const mongoose = require("mongoose");
let {Card} = require("../models/Card");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getAllProjectCards = async (projectId) => {
  return Card.find({ project: projectId })
    .populate({ path: "project" })
    .populate({path: "owners"})
    .populate({path: "createdBy"})
    .exec();
};

const getAllCurrentUserCards = async (userId, today) => {
  const currentTime = new Date(today);
  const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  console.log("Start of the day");
  console.log(startOfToday);
  const endOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1);
  console.log("End of the day");
  console.log(endOfToday);
  const currentWeekDay = new Date(today).getDay();
  return Card.find({$or: [
    {type: "one-time", deadline: {$gte: startOfToday, $lt: endOfToday}}, 
    {type: "recurring", startDay: {$lt: endOfToday}, pattern: currentWeekDay}
  ]}).exec();
}

const getAllUserCardsForTommorow = async (userId, today) => {
  const date = new Date(today);
  const tommorow = new Date(date.setDate(date.getDate() + 1));
  console.log(tommorow);
  const startOfTommorow = new Date(
    tommorow.getFullYear(),
    tommorow.getMonth(),
    tommorow.getDate()
  );
  const endOfTommorow = new Date(
    tommorow.getFullYear(),
    tommorow.getMonth(),
    tommorow.getDate() + 1
  );
  const tommorowWeekDay = new Date(today).getDay();
  return Card.find({
    $or: [
      {
        type: "one-time",
        deadline: { $gte: startOfTommorow, $lt: endOfTommorow },
      },
      {
        type: "recurring",
        startDay: { $lt: endOfTommorow },
        pattern: tommorowWeekDay,
      },
    ],
  }).exec();
}

const createCard = async (data) => {
  const card = new Card({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    description: data.description,
    project: data.project,
    links: [...data.links],
    startDay: data.startDay,
    deadline: data.deadline,
    type: data.type,
    pattern: [...data.pattern],
    owners: [...data.owners],
    createdBy: data.createdBy,
    organization: data.organization,
  });
  return card.save();
}

const updateCard = async (data) => {
  const updatedCard = {
    name: data.name,
    description: data.description,
    links: [...data.links],
    startDay: data.startDay,
    deadline: data.deadline,
    type: data.type,
    pattern: [...data.pattern],
    owners: [...data.owners],
  };
  return Card.findByIdAndUpdate(data._id, updatedCard, {new: true}).exec();
}

const deleteCard = async (cardId) => {
  return Card.findByIdAndDelete(cardId).exec();
}

module.exports = {
  getAllProjectCards,
  getAllCurrentUserCards,
  getAllUserCardsForTommorow,
  createCard,
  updateCard,
  deleteCard,
};
