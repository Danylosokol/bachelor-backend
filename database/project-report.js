require("dotenv").config();
const mongoose = require("mongoose");
let { ProjectReport } = require("../models/ProjectReport");

mongoose.set("strictQuery", false);
// Connects to the MongoDB database using the URI stored in the .env file "MONGO_URI"
// Additional options are provided to use the new URL string parser and the new server topology engine
// The database name is also specified
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

// Function to get all project reports for a specific project
const getAllProjectReports = async (projectId) => {
  // The .populate() is used to automatically replace the specified path in the document, which is originally the ID of a referenced document, with the actual document from another collection.
  return ProjectReport.find({ project: projectId })
    .populate({ path: "project" })
    .populate({ path: "createdBy" })
    .populate({ path: "resultCards.card", model: "Card" })
    .populate({ path: "planedCards" })
    .populate({ path: "resultCards.feedbacks.createdBy" })
    .populate({ path: "resultCards.feedbacks.report" })
    .populate({ path: "ownFeedbacks.user" })
    .sort({ date: -1 })
    .exec();
};

// Function to retrieve all project reports for a specific organization
const getAllOrganizationReports = async (organizationId) => {
  return ProjectReport.find({ organization: organizationId })
    .populate({ path: "project" })
    .populate({ path: "createdBy" })
    .populate({ path: "resultCards.card" })
    .populate({ path: "planedCards" })
    .populate({ path: "resultCards.feedbacks.createdBy" })
    .populate({ path: "resultCards.feedbacks.report" })
    .populate({ path: "ownFeedbacks.user" })
    .sort({ date: -1 })
    .exec();
};

// Function to create a project report from a given data
const createProjectReport = async (data) => {
  const projectReport = new ProjectReport({
    _id: new mongoose.Types.ObjectId(),
    date: new Date(),
    startDay: new Date(data.startDay),
    endDay: new Date(data.endDay),
    createdBy: data.user,
    project: data.project,
    organization: data.organization,
    resultCards: [...data.resultCards],
    planedCards: [...data.planedCards],
    ownFeedbacks: [...data.ownFeedbacks]
  });
  return projectReport.save();
};

// Function to update in a project report result and planed cards by report's id
const updateProjectReport = async (data) => {
  const updatedProjectReport = {
    resultCards: [...data.resultCards],
    planedCards: [...data.planedCards],
  };
  return ProjectReport.findByIdAndUpdate(data._id, updatedProjectReport, {
    new: true,
  }).exec();
};

// Function to remove project report by its id
const deleteProjectReport = async (reportId) => {
  return ProjectReport.findByIdAndDelete(reportId);
};

module.exports = {
  getAllProjectReports,
  getAllOrganizationReports,
  createProjectReport,
  updateProjectReport,
  deleteProjectReport,
};
