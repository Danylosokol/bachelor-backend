const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personReportSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    date: { type: Date },
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    organization: {type: mongoose.Schema.Types.ObjectId, ref: "Organization"},
    tasks: [{
      date: {type: String},
      description: {type: String},
      rating: {type: String},
      links: [{
        url: {type: String},
        title: {type: String}
      }],
      project: {type: mongoose.Schema.Types.ObjectId, ref: "Project"},
      status: {type: String}
    }],
  },
  {
    collection: "personal-reports",
  }
);

const PersonalReport = mongoose.model("PersonalReport", personReportSchema);

module.exports = {
  PersonalReport,
};
