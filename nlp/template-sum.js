const summarizeByTemplate = async (feedbacks) => {
  const templatesSum = [];
  for(let i in feedbacks){
    for(let j in feedbacks[i].templates){
      const indx = templatesSum.findIndex(
        (templ) => templ.name === feedbacks[i].templates[j]["name"]
      );
      if(indx === -1){
        const newTemplate = {
          name: feedbacks[i].templates[j]["name"],
          action: feedbacks[i].templates[j]["action"],
          feedbacks: [feedbacks[i].templates[j]["feedback"]],
        };
        templatesSum.push(newTemplate);
      }else{
       templatesSum[indx]["feedbacks"].push(
         feedbacks[i].templates[j]["feedback"]
       );
      }
    }
  }
  let result = "";
  for(let i in templatesSum){
    if(templatesSum[i]["action"] === "sum"){
      templatesSum[i]["result"] = templatesSum[i]["feedbacks"].reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue), 0);
    }else if(templatesSum[i]["action"] === "average"){
      const sum = templatesSum[i]["feedbacks"].reduce(
        (accumulator, currentValue) => Number(accumulator) + Number(currentValue),
        0
      );
      templatesSum[i]["result"] = Math.round(Number(sum) / templatesSum[i]["feedbacks"].length * 10)/10;
    }else{
      // removing duplicated and empty strings
      templatesSum[i]["feedbacks"] = templatesSum[i]["feedbacks"].filter(string => string);
      templatesSum[i]["feedbacks"] = Array.from(new Set(templatesSum[i]["feedbacks"]));
      templatesSum[i]["result"] = templatesSum[i]["feedbacks"].join(", ")
    }
    result = `${result}${templatesSum[i]["name"]}: ${templatesSum[i]["result"]}; \n\n`;
  }
  result = result.trim();
  return result;
}

module.exports = {
  summarizeByTemplate,
}