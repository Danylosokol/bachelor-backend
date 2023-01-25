require("dotenv").config();
const mongoose = require("mongoose");
let { PersonalReport } = require("../models/PersonalReport");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getAllUserReports = async (userId) => {
  return PersonalReport.find({ user: userId }).populate({path: "tasks.project"}).exec();
};

const getLastUserReport = async (userId) => {
  return PersonalReport.findOne({ user: userId })
    .sort({ date: -1 })
    .populate({ path: "tasks.project" })
    .exec();
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

const updatePersonalReport = async (data) => {
  const updatedReport = {
    user: data.user,
    organization: data.organization,
    tasks: [...data.tasks],
  };
  return PersonalReport.findByIdAndUpdate(data._id, updatedReport).exec();
}

const deletePersonalReport = async (reportId) => {
  return PersonalReport.findByIdAndDelete(reportId);
}

module.exports = {
  getAllUserReports,
  getLastUserReport,
  createPersonalReport,
  updatePersonalReport,
  deletePersonalReport,
};