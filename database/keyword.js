require("dotenv").config();
const mongoose = require("mongoose");
let { Keywords } = require("../models/Keywords");
const fs = require("fs");
const fileContent = fs.readFileSync("nlp/keywords.json");
// JSON contains array of keywords from predefined dictionary from summarization
const keywords = JSON.parse(fileContent);

mongoose.set("strictQuery", false);
// Connects to the MongoDB database using the URI stored in the .env file "MONGO_URI"
// Additional options are provided to use the new URL string parser and the new server topology engine
// The database name is also specified
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "bachelor-project",
});

// Get all keywords object with array of all keywords from the predefined dictionary and added during app use for specific organization
const getAllKeywords = async (organizationId) => {
  const keywords = await Keywords.find({organization: organizationId}).exec();
  return keywords[0];
}

// Create a keyword object for new organization
const createKeywords = async (data) => {
  const keyword = new Keywords({
    _id: new mongoose.Types.ObjectId(),
    keywords: keywords.keywords,
    organization: data.organization,
    options: data.options,
  });
  return keyword.save();
}

// Add new keyword added by user in the modal window when app haven't found any keywords in the whole user feedback
const updateKeywords = async (data) => {
  return Keywords.findOneAndUpdate({organization: data.organization}, {"$push": {"keywords": {"$each": data.keywords}}}, { new: true }).exec();
};

// Function to delete keywords object for specific organization
const deleteKeywords = async (organizationId) => {
  return Keywords.findOneAndDelete({organization: organizationId}).exec();
};

module.exports = {
  getAllKeywords,
  createKeywords,
  updateKeywords,
};
