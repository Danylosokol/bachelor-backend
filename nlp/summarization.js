const {summarizeWithoutTemplates} = require("./dict-sum.js");
const {summarizeByTemplate} = require("./template-sum.js");

const summarization = async (cards, regexes) => {
  const summarizedCards = await Promise.all(cards.map(async (card) => {
    if(card.templates && card.templates.length){
      card.result = await summarizeByTemplate(card.personalFeedbacks);
    }else{
      const summarizationObj = await summarizeWithoutTemplates(card.personalFeedbacks, regexes);
      card.result = summarizationObj.result;
      card.unmatchedFeedbacks = summarizationObj.unmatchedFeedbacks;
    }
    card.links = await summarizeLinks(card.personalFeedbacks);
    return card;
  }));
  return summarizedCards;
}

const summarizeLinks = (feedbacks) => {
  const finalLinks = [];
  for(let i in feedbacks){
    for(let j in feedbacks[i].links){
      const indx = finalLinks.findIndex((link) => link.url === feedbacks[i].links[j]["url"]);
      if(indx === -1){
        finalLinks.push(feedbacks[i].links[j]);
      }
    }
  }
  return finalLinks;
}

module.exports = {
  summarization,
}