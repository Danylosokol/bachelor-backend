require("dotenv").config();
const mongoose = require("mongoose");
let { Organization } = require("../models/Organization");
const {createUser} = require("./user.js");
let {Card} = require("../models/Card");
let {User} = require("../models/User");
let {Project} = require("../models/Project");
let {PersonalReport} = require("../models/PersonalReport");
let {ProjectReport} = require("../models/ProjectReport");
const { Keywords } = require("../models/Keywords");

mongoose.set("strictQuery", false);
// Connects to the MongoDB database using the URI stored in the .env file "MONGO_URI"
// Additional options are provided to use the new URL string parser and the new server topology engine
// The database name is also specified
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
})

// Function to create new organization and also create new users that are members of this organization this function calls after user submit the form on the /create-organization page
const createOrganization = async (data) => {
  const members = [];
  // iterate through organization's memebrs and save them to the Users collection
  for (let i in data.members) {
    const newMember = await createUser(data.members[i]);
    members.push(newMember._id);
  }
  // Save new organization to the Organization collection
  const organization = new Organization({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    members: [...members],
  });
  return organization.save();
};

// Function to find user in the organization based on the user's email, this function calls during the authentication
const findUserInOrganizations = async (email) => {
  // Retrieves all organizations and populates their 'members' fields. The 'match' option is used to only populate members with a matching email.
  const organizations = await Organization.find().populate({
    path: "members",
    match: { email: email },
  });
  // Filters the organizations to only include those with at least one member. The [0] at the end returns the first organization from the filtered organizations. So as user can be only in one organization we will get array one organization long or if user is not in the database (respectively not in organization) empty array and after accessing first element "undefined";
  const organization = organizations.filter((organization) => {
    return organization.members.length;
  })[0];
  // If an organization was found, extracts the first member of the organization and the organization details,
  if (organization) {
    const user = organization.members[0];
    const result = {
      company: { _id: organization._id, name: organization.name },
      user: user,
    };
    return result;
  } else {
    // If no organization was found, returns null.
    return null;
  }
};

// Function will find user in the organization by id and return object of this user
const getUsersInOrganization = async (id) => {
  return Organization.findById(id, "members").populate({path: "members"}).exec();
};

// Function will add id of the new user to the given organization
const addUserToOrganization = async (userId, organizationId) => {
  const newOrganization = await Organization.findOneAndUpdate(
    { _id: organizationId },
    { $push: { members: userId } },
    { new: true }
  );
  return newOrganization;
};

// Function deletes organization and all data including profiles that are connected to this organization
const deleteOrganization = async (organizationId) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // fetch the organization
    const organization = await mongoose
      .model("Organization")
      .findOne({ _id: organizationId })
      .session(session);

    if (!organization) {
      throw new Error("Organization not found");
    }

    // delete users in the organization
    await User
      .deleteMany({ _id: { $in: organization.members } })
      .session(session);

    // delete cards linked with organization
    await Card
      .deleteMany({ organization: organizationId })
      .session(session);

    // delete keywords linked with organization
    await Keywords
      .deleteMany({ organization: organizationId })
      .session(session);

    // delete person reports linked with organization
    await PersonalReport
      .deleteMany({ organization: organizationId })
      .session(session);

    // delete projects linked with organization
    await Project
      .deleteMany({ organization: organizationId })
      .session(session);

    // delete project reports linked with organization
    await ProjectReport
      .deleteMany({ organization: organizationId })
      .session(session);

    // delete organization
    await Organization
      .deleteOne({ _id: organizationId })
      .session(session);

    // commit transaction
    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    console.error("Error deleting organization and data: ", error);
    // If an error occurred, abort the transaction
    session.abortTransaction();
    session.endSession();
    throw error;
  }
}

module.exports = {
  createOrganization,
  findUserInOrganizations,
  getUsersInOrganization,
  addUserToOrganization,
  deleteOrganization,
}