const { SentenceTokenizer } = require("natural");
const moment = require("moment");
const fs = require("fs");
const {getAllKeywords} = require("../database/keyword");

const sentenceTokenizer = new SentenceTokenizer();

const summarizeWithoutTemplates = async (feedbacks, regexes) => {
  const resultArr = [];
  const unmatchedFeedbacks = [];
  for (let i in feedbacks) {
    const matchedSentences = [];
    const sentences = sentenceTokenizer.tokenize(feedbacks[i]["feedback"]);
    sentences.forEach((sentence) => {
      for (let j in regexes) {
        if (regexes[j].test(sentence)) {
          console.log(sentence);
          console.log(regexes[j]);
          matchedSentences.push(sentence);
          break;
        }
      }
    });
    console.log(sentences);
    console.log(matchedSentences);
    console.log("---------------");
    let summarization = matchedSentences.join(" ");
    if (!summarization.length) {
      if (feedbacks[i]["feedback"]){
        unmatchedFeedbacks.push(feedbacks[i]["feedback"]);
      }
    }else{
      summarization = summarization.trim() +
        ` - by ${feedbacks[i]["createdBy"]["name"]} (${moment(
          new Date(feedbacks[i]["date"])
        ).format("DD-MM-YYYY")})`;
      resultArr.push(summarization);
    }
  }
  const result = {
    result: resultArr.join("\n"),
    unmatchedFeedbacks: unmatchedFeedbacks,
  }
  return result;
}

module.exports = {
  summarizeWithoutTemplates,
}



