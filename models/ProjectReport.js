const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectReportSchema = new Schema(
  {
    // id of the document
    _id: mongoose.Schema.Types.ObjectId,
    // date when project report was created
    date: { type: Date },
    // period of time that the project report covers
    startDay: { type: Date },
    endDay: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // reference to the project to which the report relates
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    // reference to the organization to which the project report relates
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    // the field of cards that were active in the project in a given period of time
    resultCards: [
      {
        // reference to the card itself
        card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
        // the result of the summation of all feedbacks written for this card during the selected time period
        result: { type: String },
        // unique links left in the feedbacks written for this card during the selected period of time
        links: [
          {
            url: { type: String },
            title: { type: String },
          },
        ],
        // the array of the feedback documents, which were written for this card during the selected period of time
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
    // array of planned cards as of the selected time interval covered by the project report
    planedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    // array of cards and feedbacks created during selected time interval by users and assigned to this project
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