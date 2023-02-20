console.time("myScript");
const reachOut = `I unexpectedly worked on company onesheeters today which I never did properly before so that was a litle bit of change. We started using the 1sheeter app but we found out that something must have gone wrong with Finstat and Growio scraping because it was not working. LinkedIn also broke but we fixed that with new Linkedin profile, Danylo added to the app. Information from Finstat had to be added by hand.`;

const feedbacks = [
  {
    name: "Adma Kalinich",
    date: new Date("2023-02-10"),
    feedback: `I unexpectedly worked on company onesheeters today which I never did properly before so that was a litle bit of change. We started using the 1sheeter app but we found out that something must have gone wrong with Finstat and Growio scraping because it was not working. LinkedIn also broke but we fixed that with new Linkedin profile, Danylo added to the app. Information from Finstat had to be added by hand.`,
  },
  {
    name: "Martin Petricenko",
    date: new Date("2023-02-10"),
    feedback: `Today I worked on a project that required me to use a new software tool, which was a bit of a challenge at first. Although the software didn't work perfectly, I was able to work around the issues and still complete the project. I did have to manually enter some information, but overall it was a good learning experience`,
  },
  {
    name: "Andrej Platchenko",
    date: new Date("2023-02-10"),
    feedback: `I was assigned a task that involved working with a team to create a new product. It was an exciting challenge that required us to collaborate and think creatively. Although we ran into some issues with the production process, we were able to brainstorm solutions and complete the project on time. I am proud of our teamwork and the final result.`,
  },
  {
    name: "Misha Asyran",
    data: new Date("2023-02-01"),
    feedback: `I was given the responsibility of analyzing a large data set which required me to use a new data analytics software. Although the software was unfamiliar to me at first, I quickly became comfortable with its functionality and was able to complete the analysis accurately and efficiently. I enjoyed the challenge of working with new tools and feel that I gained valuable skills from this experience.`,
  },
  {
    name: "Ruslan Bober",
    data: new Date("2023-02-02"),
    feedback: `Today I had the opportunity to work on a project which required me to communicate with a variety of stakeholders. It was a complex task that required me to balance multiple priorities and ensure that everyone was on the same page. Although it was a bit stressful at times, I was able to stay organized and focused. I feel that this experience helped me improve my communication and project management skills.`,
  },
];

require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const apiKey = "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";

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

const processFedbacks = async (feedbacks) => {
  const summarizedFeedbacks = [];
  for (let i in feedbacks) {
    console.log(i);
    console.log("\n");
    console.log(feedbacks[i].feedback);
    console.log("\n");
    const summarization = await summarizeFeedback(feedbacks[i].feedback);
    summarizedFeedbacks.push(summarization);
  }
  console.log("RESULT:");
  console.log(summarizedFeedbacks);
  console.timeEnd("myScript");
};

const summarizeFeedback = async (feedback) => {
  console.log("PROMPT:");
  const prompt = `Provide very brief summary of next employee's feedback on the work task: "${feedback}"`;
  console.log(prompt);
  const response = await openai.createCompletion({
    model: "text-curie-001",
    prompt: prompt,
    temperature: 0.01,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data.choices[0].text;
};

const start = async () => {
  await processFedbacks(feedbacks);
  // await summarizeFeedback(feedbacks[1].feedback);
};

start();

// NODE-SUMMARY
// -----------------------------------------------------------------------------------
// var SummaryTool = require("node-summary");

const reachOut = [
  "I reached out to 20 candidates on LinkedIn today and received responses from 5 of them.",
  "I sent connection requests to 50 potential candidates on LinkedIn and heard back from 10 of them by the end of the day.",
  "I personalized my messages to each of the 15 candidates I reached out to and received positive responses from 3 of them today.",
  "I identified 30 potential candidates on LinkedIn and sent them messages, and 7 of them responded by the end of the day.",
  "I reached out to 10 candidates today and had a 50% response rate, resulting in 5 positive responses.",
  "I unexpectedly worked on company onesheeters today which I never did properly before so that was a litle bit of change. We started using the 1sheeter app but we found out that something must have gone wrong with Finstat and Growio scraping because it was not working. LinkedIn also broke but we fixed that with new Linkedin profile, Danylo added to the app. Information from Finstat had to be added by hand."
];
// const title = "";

// SummaryTool.summarize(title, reachOut, function (err, summary) {
//   if (err) console.log("Something went wrong man!");

//   console.log(summary);

//   console.log("Original Length " + (title.length + reachOut.length));
//   console.log("Summary Length " + summary.length);
//   console.log(
//     "Summary Ratio: " +
//       (100 - 100 * (summary.length / (title.length + reachOut.length)))
//   );
// });

// CO:HERE
// -------------------------------------------------------------
// const axios = require("axios");
// const natural = require("natural");

// const tokenizer = new natural.WordTokenizer();

// const words = tokenizer.tokenize(reachOut);

// console.log(words);

// const numWords = words.length;

// const maxTokens = Math.round(numWords*2/3);

// const options = {
//   method: "POST",
//   url: "https://api.cohere.ai/generate",
//   headers: {
//     accept: "application/json",
//     "Cohere-Version": "2022-12-06",
//     "content-type": "application/json",
//     authorization: "Bearer EDxcjbAy6cgb78jYmSz7jQ16A1IJHg5vWbSZ29DF",
//   },
//   data: {
//     model: "xlarge",
//     truncate: "END",
//     prompt: reachOut,
//     max_tokens: maxTokens,
//     k: 0,
//     p: 0.75,
//     temperature: 0.1,
//     frequency_penalty: 1.0,
//     truncate: "NONE",
//   },
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });
