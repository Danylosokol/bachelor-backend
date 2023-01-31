const lda = require("ldanode");

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

const text = "I've finished react form for the frontend part of the project";

const ldaModel = new lda();

ldaModel.addText(text);

ldaModel.process(2, function (err, data) {
  if (err) {
    console.log(err);
    return;
  }
  const topics = data[0];
  let bestProject;
  let maxSimilarity = 0;
  for (const project of projects) {
    let similarity = 0;
    for (const topic of topics) {
      for (const keyword of project.keywords) {
        if (topic.includes(keyword)) {
          similarity++;
        }
      }
    }
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestProject = project;
    }
  }
  console.log(
    `The text is most likely related to the ${bestProject.name} project.`
  );
});
