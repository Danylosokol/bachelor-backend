const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectReportSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    date: { type: Date },
    startDay: { type: Date },
    endDay: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    resultCards: [
      {
        card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
        result: { type: String },
        links: [
          {
            url: { type: String },
            title: { type: String },
          },
        ],
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
            project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
            rating: { type: String },
            type: { type: String },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            date: { type: Date },
            report: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "PersonalReport",
            },
          },
        ],
      },
    ],
    planedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    ownFeedbacks: [
      {
        id: { type: String },
        name: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        description: { type: String },
        feedback: { type: String },
        links: [
          {
            url: { type: String },
            title: { type: String },
          },
        ],
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        rating: { type: String },
      },
    ],
  },
  {
    collection: "project-reports",
  }
);

const ProjectReport = mongoose.model("ProjectReport", projectReportSchema);

module.exports = {
  ProjectReport,
}