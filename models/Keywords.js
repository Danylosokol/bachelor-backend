const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keywordsSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    keywords: [{type: String}],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    options: {type: String}
  },
  {
    collection: "keywords",
  }
);

const Keywords = mongoose.model("Keywords", keywordsSchema);

module.exports = {
  Keywords,
};
