const {summarizeWithoutTemplates} = require("./dict-sum.js");
const {summarizeByTemplate} = require("./template-sum.js");

// Function to summarize feedback from cards, using for summarization without template keywords in the form of regexes
const summarization = async (cards, regexes) => {
  // Map through all cards
  const summarizedCards = await Promise.all(cards.map(async (card) => {
    // If the card has templates, use template summarization
    if (card.templates && card.templates.length) {
      card.result = await summarizeByTemplate(card.personalFeedbacks);
    } else {
      // Otherwise, use summarization with keywords
      const summarizationObj = await summarizeWithoutTemplates(
        card.personalFeedbacks,
        regexes
      );
      card.result = summarizationObj.result;
      card.unmatchedFeedbacks = summarizationObj.unmatchedFeedbacks;
    }
    // Summarize the links present in the feedbacks
    card.links = await summarizeLinks(card.personalFeedbacks);
    return card;
  }));
  return summarizedCards;
}

// Function to summarize the links present in feedbacks
const summarizeLinks = (feedbacks) => {
  const finalLinks = [];
  for(let i in feedbacks){
    for(let j in feedbacks[i].links){
      // If the link is not already in finalLinks, add it
      const indx = finalLinks.findIndex(
        (link) => link.url === feedbacks[i].links[j]["url"]
      );
      if (indx === -1) {
        finalLinks.push(feedbacks[i].links[j]);
      }
    }
  }
  return finalLinks;
}

module.exports = {
  summarization,
}