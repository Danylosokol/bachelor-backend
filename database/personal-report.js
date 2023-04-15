require("dotenv").config();
const mongoose = require("mongoose");
let { PersonalReport } = require("../models/PersonalReport");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getAllPersonalReports = async (organizationId) => {
  return PersonalReport.find({ organization: organizationId })
    .populate({path: "user"})
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .exec();
};

const getAllPersonalReportsByDate = async (date, organizationId) => {
  const dateObj = new Date(date);
  console.log(dateObj);
  const startOfDay = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    23,
    59,
    59,
    999
  );
  return PersonalReport.find({
    $and: [
      { organization: organizationId },
      { date: { $gte: startOfDay, $lte: endOfDay } },
    ],
  })
    .populate({ path: "user" })
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .exec();
};

const getAllUserReports = async (userId) => {
  return PersonalReport.find({ user: userId })
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .sort({ date: -1 })
    .exec();
};

const getLastUserReport = async (userId) => {
  return PersonalReport.findOne({ user: userId })
    .sort({ date: -1 })
    .populate({ path: "tasks.project" })
    .exec();
};
// Get from collection last personal report based on userId, and from that report extract only array of feedbacks and filter that array so it will have only objects that has no atribute card.
const getPlanedCustomFeedbacks = async (userId) => {
  const lastReport = await PersonalReport.findOne({ user: userId })
    .populate({ path: "user" })
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .sort({
      date: -1,
    });
  // feedbacks with null cards are not custom, but their card was deleted after feedback creation
  const customFeedbacks =
    lastReport && lastReport.feedbacks
      ? lastReport.feedbacks.filter(
          (feedback) =>
            feedback.card === undefined && feedback.type === "planed"
        )
      : [];
  return customFeedbacks;
};

const getOwnFeedbacks = async (startTimeStamp, endTimeStamp, projectId) => {
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
  const reports = await PersonalReport.find({
    $and: [
      { "feedbacks.card": undefined },
      { date: { $gte: startDateUTC, $lte: endDateUTC } },
    ],
  })
    .populate({ path: "user" })
    .exec();
  console.log(reports);
  const ownFeedbacks = reports.flatMap((report) =>
    report.feedbacks
      .filter(
        (feedback) =>
          feedback.card === undefined && feedback.project == projectId && feedback.type === "current"
      )
      .map((feedback) => ({ ...feedback._doc, user: report.user }))
  );
  return ownFeedbacks;
};

const createPersonalReport = async (data) => {
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
    feedbacks: [...data.feedbacks],
  };
  return PersonalReport.findByIdAndUpdate(data._id, updatedReport, {
    new: true,
  }).exec();
};


const deletePersonalReport = async (reportId) => {
  return PersonalReport.findByIdAndDelete(reportId);
};

module.exports = {
  getAllPersonalReports,
  getAllPersonalReportsByDate,
  getAllUserReports,
  getLastUserReport,
  getPlanedCustomFeedbacks,
  getOwnFeedbacks,
  createPersonalReport,
  updatePersonalReport,
  deletePersonalReport,
};
