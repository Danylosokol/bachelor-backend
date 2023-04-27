const { SentenceTokenizer } = require("natural");
const moment = require("moment");

const sentenceTokenizer = new SentenceTokenizer();

// Define the async function summarizeWithoutTemplates
const summarizeWithoutTemplates = async (feedbacks, regexes) => {
  // Initialize empty array to store the summarized feedbacks and unmatched feedbacks
  const resultArr = [];
  const unmatchedFeedbacks = [];
  // Iterate through the feedbacks
  for (let i in feedbacks) {
    // Initialize empty array to store sentences with keywords
    const matchedSentences = [];
    // Split the feedback into sentences
    const sentences = sentenceTokenizer.tokenize(feedbacks[i]["feedback"]);
    // Iterate through the sentences and check if they match any of the regexes
    sentences.forEach((sentence) => {
      for (let j in regexes) {
        if (regexes[j].test(sentence)) {
          // If a sentence have keyword inside, add it to the matchedSentences array and stop checking other regexes
          matchedSentences.push(sentence);
          break;
        }
      }
    });
    // Join the matched sentences into one string
    let summarization = matchedSentences.join(" ");
    // If there are no matched sentences, add the entire feedback to the unmatchedFeedbacks array
    if (!summarization.length) {
      // Check if feedback is not empty
      if (feedbacks[i]["feedback"]) {
        unmatchedFeedbacks.push(feedbacks[i]["feedback"]);
      }
    } else {
      // If there are matched sentences, append the author's name and date
      summarization =
        summarization.trim() +
        ` - by ${feedbacks[i]["createdBy"]["name"]} (${moment(
          new Date(feedbacks[i]["date"])
        ).format("DD-MM-YYYY")})`;
      // Add the summarization to the resultArr
      resultArr.push(summarization);
    }
  }
  // Create object with summarized feedbacks and unmatched feedbacks
  const result = {
    result: resultArr.join("\n\n"),
    unmatchedFeedbacks: unmatchedFeedbacks,
  };
  return result;
};


// const summarizeWithoutTemplates = async (feedbacks, regexes) => {
//   const resultArr = [];
//   const unmatchedFeedbacks = [];
//   for (let i in feedbacks) {
//     const matchedSentences = [];
//     const sentences = sentenceTokenizer.tokenize(feedbacks[i]["feedback"]);
//     sentences.forEach((sentence) => {
//       for (let j in regexes) {
//         if (regexes[j].test(sentence)) {
//           matchedSentences.push(sentence);
//           break;
//         }
//       }
//     });
//     let summarization = matchedSentences.join(" ");
//     if (!summarization.length) {
//       if (feedbacks[i]["feedback"]){
//         unmatchedFeedbacks.push(feedbacks[i]["feedback"]);
//       }
//     }else{
//       summarization = summarization.trim() +
//         ` - by ${feedbacks[i]["createdBy"]["name"]} (${moment(
//           new Date(feedbacks[i]["date"])
//         ).format("DD-MM-YYYY")})`;
//       resultArr.push(summarization);
//     }
//   }
//   const result = {
//     result: resultArr.join("\n\n"),
//     unmatchedFeedbacks: unmatchedFeedbacks,
//   }
//   return result;
// }

module.exports = {
  summarizeWithoutTemplates,
}



