require("dotenv").config();
const mongoose = require("mongoose");
let { PersonalReport } = require("../models/PersonalReport");

mongoose.set("strictQuery", false);
// Connects to the MongoDB database using the URI stored in the .env file "MONGO_URI"
// Additional options are provided to use the new URL string parser and the new server topology engine
// The database name is also specified
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

// Function to fetch all personal reports in the organization 
const getAllPersonalReports = async (organizationId) => {
  // `.populate({path: "user"/"feedbacks.card"/"feedbacks.project"})` retrieves user/cards/project data for each personal report
  return PersonalReport.find({ organization: organizationId })
    .populate({ path: "user" })
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .exec();
};

// Function to get all personal reports for a given organization by date
const getAllPersonalReportsByDate = async (date, organizationId) => {
  const dateObj = new Date(date);
  // Calculate the start and end of the day for the provided date
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
  // Find personal reports for the given organization and date range + retrieve related user, card, and project data
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

// Function to get all personal reports for a given user using user's id
const getAllUserReports = async (userId) => {
  return PersonalReport.find({ user: userId })
    .populate({ path: "feedbacks.card" })
    .populate({ path: "feedbacks.project" })
    .sort({ date: -1 })
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

// Function to fetch all own user cards and feedbacks for them created in a given time range and assigned to the specific project. This cards and feedbacks will be used in a project report 
const getOwnFeedbacks = async (startTimeStamp, endTimeStamp, projectId) => {
  // Convert the provided start and end timestamps to Date objects and convert thme to UTC standart
  const startDate = new Date(startTimeStamp);
  const startDateUTC = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const endDate = new Date(endTimeStamp);
  const endDateUTC = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  // Set the UTC hours for the start and end dates (start at the beginning of the day, end at the end of the day)
  startDateUTC.setUTCHours(0, 0, 0, 0);
  endDateUTC.setUTCHours(23, 0, 0, 0);
  // Find personal reports that are within the date range and have no associated card (it means that this feedbacks in report were written for the card created by user)
  const reports = await PersonalReport.find({
    $and: [
      { "feedbacks.card": undefined },
      { date: { $gte: startDateUTC, $lte: endDateUTC } },
    ],
  })
    .populate({ path: "user" })
    .exec();
  // Extract own feedbacks and cards from the reports. flatMap() method returns a new array formed by applying a given callback function to each element of the array, and then flattening the result by one level. So we don't have an array of report objects, but only array of feedbacks.
  const ownFeedbacks = reports.flatMap((report) =>
    report.feedbacks
      .filter(
        (feedback) =>
          feedback.card === undefined &&
          feedback.project == projectId &&
          feedback.type === "current"
      )
      // Map the feedbacks to include user data
      .map((feedback) => ({ ...feedback._doc, user: report.user }))
  );
  return ownFeedbacks;
};

// Function to create a new presonal report from the given data
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

// Function to update personal report with given data by id
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

// Function to remove personal report from the database useing its id
const deletePersonalReport = async (reportId) => {
  return PersonalReport.findByIdAndDelete(reportId);
};

module.exports = {
  getAllPersonalReports,
  getAllPersonalReportsByDate,
  getAllUserReports,
  getPlanedCustomFeedbacks,
  getOwnFeedbacks,
  createPersonalReport,
  updatePersonalReport,
  deletePersonalReport,
};
