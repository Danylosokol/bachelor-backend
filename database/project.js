require("dotenv").config();
const mongoose = require("mongoose");
let { Project } = require("../models/Project");

mongoose.set("strictQuery", false);
// Connects to the MongoDB database using the URI stored in the .env file "MONGO_URI"
// Additional options are provided to use the new URL string parser and the new server topology engine
// The database name is also specified
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

// Function to fetch all projects for a specific organization using uts id
const getCompanyProjects = async (organisationId) => {
  // `.populate("member")` retrieves the users associated with each project
  return Project.find({ organization: organisationId })
    .populate("members")
    .exec();
};

// Function to fetch all projects for a specific user
const getUserProjects = async (userId) => {
  return Project.find({ members: userId }).populate({ path: "members" }).exec();
}

// Function to get all users in a specific project
const getUsersInProject = async (id) => {
  // Retrieve the project with the provided id and only returns the 'members' field
  return Project.findById(id, "members").populate({ path: "members" }).exec();
};

// Function to create a new project from a provided data
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

// Funtion to update specific project using provided data by its id
const updateProject = async (data) => {
  const updatedProject = {
    name: data.name,
    keywords: [...data.keywords],
    description: data.description,
    members: [...data.members],
  };
  return Project.findByIdAndUpdate(data._id, updatedProject, {
    new: true,
  }).exec();
};

// Function to delete specific project using its id
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
