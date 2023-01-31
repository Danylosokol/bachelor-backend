const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    links: [
      {
        url: { type: String },
        title: { type: String },
      },
    ],
    startDay: { type: Date },
    deadline: { type: Date },
    type: { type: String },
    pattern: [{ type: String }],
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  },
  {
    collection: "cards",
  }
);

const Card = mongoose.model("Card", cardSchema);

module.exports = {
  Card,
};
