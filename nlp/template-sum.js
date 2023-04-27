
// Define the async function summarizeByTemplate
const summarizeByTemplate = async (feedbacks) => {
  // Initialize an empty array to store the summarized templates
  const templatesSum = [];
  // Iterate through the feedbacks and their templates
  for (let i in feedbacks) {
    for (let j in feedbacks[i].templates) {
      // Check if there is already this template with feedbacks form other users in templatesSum
      const indx = templatesSum.findIndex(
        (templ) => templ.name === feedbacks[i].templates[j]["name"]
      );
      // If the template is not found in templatesSum, create an object for template with first feedback
      if (indx === -1) {
        const newTemplate = {
          name: feedbacks[i].templates[j]["name"],
          action: feedbacks[i].templates[j]["action"],
          feedbacks: [feedbacks[i].templates[j]["feedback"]],
        };
        templatesSum.push(newTemplate);
      } else {
        // If the template is found, add the feedback from this user template's feedbacks array
        templatesSum[indx]["feedbacks"].push(
          feedbacks[i].templates[j]["feedback"]
        );
      }
    }
  }
  // Initialize an empty string to store the final summarization result
  let result = "";
  // Iterate through the templates in templatesSum
  for (let i in templatesSum) {
    // Perform the specified action on the template's feedbacks
    // Find sum of feedbacks
    if (templatesSum[i]["action"] === "sum") {
      templatesSum[i]["result"] = templatesSum[i]["feedbacks"].reduce(
        (accumulator, currentValue) => Number(accumulator) + Number(currentValue),
        0
      );
    // Find average of the feedbacks
    } else if (templatesSum[i]["action"] === "average") {
      const sum = templatesSum[i]["feedbacks"].reduce(
        (accumulator, currentValue) => Number(accumulator) + Number(currentValue),
        0
      );
      templatesSum[i]["result"] = Math.round(
        (Number(sum) / templatesSum[i]["feedbacks"].length) * 10
      ) / 10;
    // Find unique strings in the feedbacks if the type of the feedbacks was set to "text"
    } else {
      // Remove empty strings
      templatesSum[i]["feedbacks"] = templatesSum[i]["feedbacks"].filter(
        (string) => string
      );
      // Remove duplicates
      templatesSum[i]["feedbacks"] = Array.from(
        new Set(templatesSum[i]["feedbacks"])
      );
      // Concatenate the feedbacks using a comma and space
      templatesSum[i]["result"] = templatesSum[i]["feedbacks"].join(", ");
    }
    // Add the template's name and result to the summarization result string
    result = `${result}${templatesSum[i]["name"]}: ${templatesSum[i]["result"]}; \n\n`;
  }
  // Remove whitespaces from the beginning and the end of the result string
  result = result.trim();
  return result;
};


// const summarizeByTemplate = async (feedbacks) => {
//   const templatesSum = [];
//   for(let i in feedbacks){
//     for(let j in feedbacks[i].templates){
//       const indx = templatesSum.findIndex(
//         (templ) => templ.name === feedbacks[i].templates[j]["name"]
//       );
//       if(indx === -1){
//         const newTemplate = {
//           name: feedbacks[i].templates[j]["name"],
//           action: feedbacks[i].templates[j]["action"],
//           feedbacks: [feedbacks[i].templates[j]["feedback"]],
//         };
//         templatesSum.push(newTemplate);
//       }else{
//        templatesSum[indx]["feedbacks"].push(
//          feedbacks[i].templates[j]["feedback"]
//        );
//       }
//     }
//   }
//   let result = "";
//   for(let i in templatesSum){
//     if(templatesSum[i]["action"] === "sum"){
//       templatesSum[i]["result"] = templatesSum[i]["feedbacks"].reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue), 0);
//     }else if(templatesSum[i]["action"] === "average"){
//       const sum = templatesSum[i]["feedbacks"].reduce(
//         (accumulator, currentValue) => Number(accumulator) + Number(currentValue),
//         0
//       );
//       templatesSum[i]["result"] = Math.round(Number(sum) / templatesSum[i]["feedbacks"].length * 10)/10;
//     }else{
//       // removing duplicated and empty strings
//       templatesSum[i]["feedbacks"] = templatesSum[i]["feedbacks"].filter(string => string);
//       templatesSum[i]["feedbacks"] = Array.from(new Set(templatesSum[i]["feedbacks"]));
//       templatesSum[i]["result"] = templatesSum[i]["feedbacks"].join(", ")
//     }
//     result = `${result}${templatesSum[i]["name"]}: ${templatesSum[i]["result"]}; \n\n`;
//   }
//   result = result.trim();
//   return result;
// }

module.exports = {
  summarizeByTemplate,
}