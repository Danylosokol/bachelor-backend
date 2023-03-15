require("dotenv").config();
const mongoose = require("mongoose");
let { Keywords } = require("../models/Keywords");
const fs = require("fs");
const fileContent = fs.readFileSync("nlp/keywords.json");
const keywords = JSON.parse(fileContent);

mongoose.set("strictQuery", false);
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

const getAllKeywords = async (organization) => {
  console.log(organization);
  return Keywords.findOne(
    { organization: organization }
  ).exec();
}

const createKeywordsFromJSON = async (data) => {
  // console.log(keywords.keywords);
  const keyword = new Keywords({
    _id: new mongoose.Types.ObjectId(),
    keywords: keywords.keywords,
    organization: data.organization,
    options: data.options,
  });
  return keyword.save();
};

const createKeywords = async (data) => {
  const keyword = new Keywords({
    _id: new mongoose.Types.ObjectId(),
    keywords: [],
    organization: data.organization,
    options: data.options,
  });
  return keyword.save();
}

const updateKeywords = async (data) => {
  return Keywords.findOneAndUpdate({organization: data.organization}, {"$push": {"keywords": {"$each": data.keywords}}}, { new: true }).exec();
};

const deleteKeywords = async (organizationId) => {
  return Keywords.findOneAndDelete({organization: organizationId}).exec();
};

// createKeywordsFromJSON({ organization: "63cd59483830bca2dc422a40", options: "mi" });

module.exports = {
  getAllKeywords,
  createKeywords,
  updateKeywords,
  deleteKeywords,
};
