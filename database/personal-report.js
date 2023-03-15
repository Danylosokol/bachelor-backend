require("dotenv").config();
const mongoose = require("mongoose");
let { PersonalReport } = require("../models/PersonalReport");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

// const getAllUserReports = async (userId) => {
//   return PersonalReport.find({ user: userId }).populate({path: "tasks.project"}).exec();
// };

const getAllNewUserReports = async (userId) => {
  return PersonalReport.find({ user: userId })
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .sort({ date: -1 })
    .exec();
}

const getLastUserReport = async (userId) => {
  return PersonalReport.findOne({ user: userId })
    .sort({ date: -1 })
    .populate({ path: "tasks.project" })
    .exec();
}
// Get from collection last personal report based on userId, and from that report extract only array of feedbacks and filter that array so it will have only objects that has no atribute card.
const getPlanedCustomFeedbacks = async (userId) => {
  const lastReport = await PersonalReport.findOne({user: userId}).sort({date: -1});
  // feedbacks with null cards are not custom, but their card was deleted after feedback creation
  const customFeedbacks = lastReport && lastReport.feedbacks ? lastReport.feedbacks.filter((feedback) => feedback.card === undefined && feedback.type === "planed") : [];
  return customFeedbacks
}

const getOwnFeedbacks = async (startDay, endDay, projectId) => {
  console.log(startDay);
  console.log(endDay);
  console.log(new mongoose.Types.ObjectId(projectId));
  const reports = await PersonalReport.find({
    $and: [
      { "feedbacks.card": undefined },
      { date: { $gte: startDay, $lte: endDay } },
    ],
  }).populate({path: "user"}).exec();
  console.log(reports);
  const ownFeedbacks = reports.flatMap(report => report.feedbacks
    .filter(feedback => feedback.card === undefined && feedback.project == projectId)
    .map(feedback => ({...feedback._doc, user: report.user}))
  );
  return ownFeedbacks;
}

const createPersonalReport = async (data) => {
  console.log(data.tasks);
  const personalReport = new PersonalReport({
    _id: new mongoose.Types.ObjectId(),
    date: new Date(),
    user: data.user,
    organization: data.organization,
    tasks: [...data.tasks],
  });
  return personalReport.save();
};

const createNewPersonalReport = async (data) => {
  const personalReport = new PersonalReport({
    _id: new mongoose.Types.ObjectId(),
    date: new Date(),
    user: data.user,
    organization: data.organization,
    feedbacks: [...data.feedbacks],
  });
  return personalReport.save();
};

const updatePersonalReport = async (data) => {
  const updatedReport = {
    user: data.user,
    organization: data.organization,
    tasks: [...data.tasks],
  };
  return PersonalReport.findByIdAndUpdate(data._id, updatedReport).exec();
}

const updateNewPersonalReport = async (data) => {
  const updatedReport = {
    user: data.user,
    organization: data.organization,
    feedbacks: [...data.feedbacks],
  };
  return PersonalReport.findByIdAndUpdate(data._id, updatedReport).exec();
};


const deletePersonalReport = async (reportId) => {
  return PersonalReport.findByIdAndDelete(reportId);
}

module.exports = {
  getAllNewUserReports,
  getLastUserReport,
  getPlanedCustomFeedbacks,
  getOwnFeedbacks,
  createPersonalReport,
  createNewPersonalReport,
  updatePersonalReport,
  updateNewPersonalReport,
  deletePersonalReport,
};