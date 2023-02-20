console.time("myScript");
const { SentenceTokenizer } = require("natural");
const moment = require("moment");
const fs = require("fs");

// const examples = [
//   "Followed up open conversations",
//   "Worked on (manual for Project recruiters) | (general manual for recruiters)",
//   "Created new version of Document",
//   "Send reminders for Action",
//   "Had a call with a candidate",
//   "I’ve put together ( Name of the document ) \\ ( task )",
//   "I’ve coordinated ( Name of the document ) \\ ( task )",
//   "Added new profiles",
//   "I did reachouts Countries (Good response rate in Сountry)",
//   "Reviewed out candidates",
//   "Gave offer to Name",
//   "Arranged call with Name",
//   "I aligned with Name (on Topic) | (and explained…)",
//   "I set up my App profile and subscribed to App",
//   "Reviewed out candidates at Application",
// ];

// const examples = [
//   {
//     name: "Adma Kalinich",
//     date: new Date("2023-02-10"),
//     feedback: `I unexpectedly worked on company onesheeters today which I never did properly before so that was a litle bit of change. We started using the 1sheeter app but we found out that something must have gone wrong with Finstat and Growio scraping because it was not working. LinkedIn also broke but we fixed that with new Linkedin profile, Danylo added to the app. Information from Finstat had to be added by hand.`,
//   },
//   {
//     name: "Martin Petricenko",
//     date: new Date("2023-02-10"),
//     feedback: `Today I worked on a project that required me to use a new software tool, which was a bit of a challenge at first. Although the software didn't work perfectly, I was able to work around the issues and still complete the project. I did have to manually enter some information, but overall it was a good learning experience`,
//   },
//   {
//     name: "Andrej Platchenko",
//     date: new Date("2023-02-10"),
//     feedback: `I was assigned a task that involved working with a team to create a new product. It was an exciting challenge that required us to collaborate and think creatively. Although we ran into some issues with the production process, we were able to brainstorm solutions and complete the project on time. I am proud of our teamwork and the final result.`,
//   },
//   {
//     name: "Misha Asyran",
//     data: new Date("2023-02-01"),
//     feedback: `I was given the responsibility of analyzing a large data set which required me to use a new data analytics software. Although the software was unfamiliar to me at first, I quickly became comfortable with its functionality and was able to complete the analysis accurately and efficiently. I enjoyed the challenge of working with new tools and feel that I gained valuable skills from this experience.`,
//   },
//   {
//     name: "Ruslan Bober",
//     data: new Date("2023-02-02"),
//     feedback: `Today I had the opportunity to work on a project which required me to communicate with a variety of stakeholders. It was a complex task that required me to balance multiple priorities and ensure that everyone was on the same page. Although it was a bit stressful at times, I was able to stay organized and focused. I feel that this experience helped me improve my communication and project management skills.`,
//   },
// ];

const examples = [
  {
    name: "Adma Kalinich",
    date: new Date("2023-02-10"),
    feedback: `I went over the news from all of the companies. But only a few posts were there`,
  },
  {
    name: "Martin Petricenko",
    date: new Date("2023-02-10"),
    feedback: `Followed up open conversations. With some candidates we managed to schedule interviews.`,
  },
  {
    name: "Andrej Platchenko",
    date: new Date("2023-02-10"),
    feedback: `Gave offer to Danylo Sokol.`,
  },
  {
    name: "Misha Asyran",
    date: new Date("2023-02-01"),
    feedback: `Created new version of case study`,
  },
  {
    name: "Ruslan Bober",
    date: new Date("2023-02-02"),
    feedback: `Had calls with two candidates. First one is waiting for performance review, the second one is not confident in passing tech part.`,
  },
];

const fileContent = fs.readFileSync("keywords.json");
const keywords = JSON.parse(fileContent);


const sentenceTokenizer = new SentenceTokenizer();
const regexes = keywords.keywords.map((keyword) => new RegExp(keyword, keywords.options));

const resultArr = [];
for (let i in examples) {
  const matchedSentences = [];
  const sentences = sentenceTokenizer.tokenize(examples[i]["feedback"]);
  sentences.forEach((sentence) => {
    for (let j in regexes) {
      if (regexes[j].test(sentence)) {
        matchedSentences.push(sentence);
      }
    }
  });
  let summarization = matchedSentences.join(" ");
  if(summarization.length > 0){
    summarization =
      summarization.trim() +
      ` - by ${examples[i]["name"]} ${moment(examples[i]["date"]).format(
        "DD-MM-YYYY"
      )}`;
  }else{
    summarization = examples[i]["feedback"];
    console.log("SUMMARIZATION WAS EMPTY");
  }
  resultArr.push(summarization);
}
const result = resultArr.join("\n");
console.log(result);
console.timeEnd("myScript");

