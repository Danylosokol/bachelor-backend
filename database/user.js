require("dotenv").config();
const mongoose = require("mongoose");
let { User } = require("../models/User");
let { Organization } = require("../models/Organization");

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const createUser = async (data) => {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    email: data.email,
    role: data.role,
  });
  return user.save();
};

const updateUser = async (data) => {
  const newData = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  const updatedUser = await User.findByIdAndUpdate(data._id, newData, {
    new: true,
  }).exec();
  return updateUser;
}

const deleteUser = async (userId, organizationId) => {
  await Organization.findOneAndUpdate(
    { "members": userId },
    { $pull: { members: userId} },
    { new: true }
  );
  return User.findByIdAndDelete(userId);
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
};


