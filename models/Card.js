const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    createDate: {type: Date, default: Date.now},
    links: [
      {
        url: { type: String },
        title: { type: String },
      },
    ],
    templates: [{
      name: {type: String},
      type: {type: String},
      action: {type: String},
    }],
    startDate: { type: Date },
    endDate: { type: Date },
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
