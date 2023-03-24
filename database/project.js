require("dotenv").config();
const mongoose = require("mongoose");
let { User } = require("../models/User");
let { Organization } = require("../models/Organization");
let { Project } = require("../models/Project");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getCompanyProjects = async (organisationId) => {
  return Project.find({ "organization": organisationId }).populate("members").exec();
};

const getUserProjects = async (userId) => {
  return Project.find({ members: userId }).populate({ path: "members" }).exec();
}

const getUsersInProject = async (id) => {
  return Project.findById(id, "members")
    .populate({ path: "members" })
    .exec();
};

const createProject = async (data) => {
  const project = new Project({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    description: data.description,
    keywords: [...data.keywords],
    members: [...data.members],
    organization: data.organizationId,
  });
  return project.save();
};

const updateProject = async (data) => {
  const updatedProject = {
    name: data.name,
    keywords: [...data.keywords],
    description: data.description,
    members: [...data.members],
  };
  return Project.findByIdAndUpdate(data._id, updatedProject).exec();
};

const deleteProject = async (projectId) => {
  return Project.findByIdAndDelete(projectId);
};

module.exports = {
  getCompanyProjects,
  getUserProjects,
  getUsersInProject,
  createProject,
  updateProject,
  deleteProject,
};
