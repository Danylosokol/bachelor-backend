require("dotenv").config();
const mongoose = require("mongoose");
let { Organization } = require("../models/Organization");
let { User } = require("../models/User");
const {createUser} = require("./user.js");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
})

const createOrganization = async (data) => {
  const members = [];
  for (let i in data.members) {
    const newMember = await createUser(data.members[i]);
    members.push(newMember._id);
  }
  const organization = new Organization({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    members: [...members],
  });
  return organization.save();
};

const findUserInOrganizations = async (email) => {
  const organizations = await Organization.find().populate({
    path:"members", 
    match: {email: email}
  });
  const organization = organizations.filter((organization) => {
      return organization.members.length;
  })[0];
  console.log(organization);
  if (organization) {
    const user = organization.members[0];
    const result = {
      company: { _id: organization._id, name: organization.name },
      user: user,
    };
    return result;
  } else {
    return null;
  }
};

const getUsersInOrganization = async (id) => {
  return Organization.findById(id, "members").populate({path: "members"}).exec();
};

const addUserToOrganization = async (userId, organizationId) => {
  const newOrganization = await Organization.findOneAndUpdate(
    { _id: organizationId },
    { $push: { members: userId } },
    { new: true }
  );
  return newOrganization;
};

module.exports = {
  createOrganization,
  findUserInOrganizations,
  getUsersInOrganization,
  addUserToOrganization,
}