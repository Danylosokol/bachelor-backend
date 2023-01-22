const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    description: { type: String },
    keywords: [{type: String}],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    organization: {type: mongoose.Schema.Types.ObjectId, ref: "Organization"},
  },
  {
    collection: "projects",
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = {
  Project,
};
