const natural = require("natural");
const cosine = require("cosine");

// Text to be related to a project
const text = "I've finished react form for the frontend part of the project";

// List of projects, each with a list of keywords
const projects = [
  {
    name: "Web development",
    keywords: ["website", "design", "HTML", "CSS"],
  },
  {
    name: "HR",
    keywords: ["candidate", "spreadsheet", "screening", "lead"],
  },
  {
    name: "Analytics",
    keywords: [
      "data mining",
      "Predictive modeling",
      "Data visualization",
      "Business intelligence",
    ],
  },
];

// Tokenize text and extract keywords
const textKeywords = natural.PorterStemmer.tokenizeAndStem(text);

//Checking if the text is not empty or null
if (textKeywords.length === 0) {
  console.log("Text is empty or null");
  return;
}

// Iterate through each project
let maxSimilarity = 0;
let relatedProject;
projects.forEach((project) => {
  // Tokenize project keywords
  let projectKeywords = project.keywords;

  // Stem the project keywords
  projectKeywords = projectKeywords.map((keyword) =>
    natural.PorterStemmer.stem(keyword)
  );

  //Checking if the project keywords are not empty or null
  if (projectKeywords.length === 0) {
    console.log("Project keywords are empty or null");
    return;
  }

  // Make sure that the text keywords and project keywords have the same length
  if (textKeywords.length > projectKeywords.length) {
    const diff = textKeywords.length - projectKeywords.length;
    for (let i = 0; i < diff; i++) {
      projectKeywords.push(0);
    }
  } else if (textKeywords.length < projectKeywords.length) {
    const diff = projectKeywords.length - textKeywords.length;
    for (let i = 0; i < diff; i++) {
      textKeywords.push(0);
    }
  }

  // Calculate cosine similarity between text keywords and project keywords
  const similarity = cosine(textKeywords, projectKeywords);
  console.log(similarity);
  // If this project has a higher similarity, update the related project
  if (similarity > maxSimilarity) {
    maxSimilarity = similarity;
    relatedProject = project.name;
  }
});

if (maxSimilarity === 0) {
  console.log("No Similarity found");
} else {
  console.log(`The related project is: ${relatedProject}`);
}
