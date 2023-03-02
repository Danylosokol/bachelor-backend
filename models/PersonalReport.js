const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personReportSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    date: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    feedbacks: [
      {
        id: { type: String },
        card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
        name: { type: String },
        description: { type: String },
        feedback: { type: String },
        links: [
          {
            url: { type: String },
            title: { type: String },
          },
        ],
        templates: [
          {
            name: { type: String },
            type: { type: String },
            action: { type: String },
            feedback: {type: String},
          },
        ],
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        rating: { type: String },
        type: { type: String },
      },
    ],
  },
  {
    collection: "personal-reports",
  }
);

const PersonalReport = mongoose.model("PersonalReport", personReportSchema);

module.exports = {
  PersonalReport,
};
