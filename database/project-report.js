require("dotenv").config();
const mongoose = require("mongoose");
let { ProjectReport } = require("../models/ProjectReport");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getAllProjectReports = async (projectId) => {
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

const updateProjectReport = async (data) => {
  const updatedProjectReport = {
    resultCards: [...data.resultCards],
    planedCards: [...data.planedCards],
  };
  return ProjectReport.findByIdAndUpdate(data._id, updatedProjectReport, {
    new: true,
  }).exec();
};

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
