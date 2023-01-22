const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    email: { type: String },
    role: { type: String },
  },
  {
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User
};
