const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const organizationSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    members: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  },
  {
    collection: "organizations",
  }
);

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = {
  Organization
};
