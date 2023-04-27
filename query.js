// This function takes an array of nlp object's terms and generates a regex pattern for matching different grammatical forms of this term
const createRegex = (terms) => {
  // Initialize an array to store the final regex
  const finalArray = [];
  // Initialize variables to store shortcut and complex form of the word
  let shortCut = "";
  let complex = "";
  // Iterate over the terms form nlp pbject
  for (let i in terms) {
    const term = terms[i];
    // If the term has a post value and it's not a space, concatenate text of the term with post values. Example of the post value: char "-"
    if (term.post && term.post !== " ") {
      complex = term.text + term.post;
    // If the term is a verb, generate regex patterns for all verb forms.
    } else if (term.tags.includes("Verb")) {
      let regex;
      // if complex variable is not empty string
      if (complex.length) {
        complex = complex + term.text;
        // Example of the complex word "user-friendly"
        regex = getAllVerbForms(complex);
        complex = "";
      } else {
        regex = getAllVerbForms(term);
      }
      // If there's a shortcut expression, append the regex pattern and add it to the finalArray. Expamle of the schortCut: "I'm"
      if (shortCut.length) {
        shortCut = `${shortCut}${regex}))`;
        finalArray.push(shortCut);
        shortCut = "";
      } else {
        finalArray.push(regex);
      }
    // If the term is a noun with an "'" char, start a shortcut expression.
    } else if (term.tags.includes("Noun") && term.text.includes("'")) {
      shortCut = `((${term.text})|(`;
      const regex = getAllNounForms(term);
      shortCut = `${shortCut}${regex}\\s+`;
    // If the term is a noun, generate regex patterns for all noun forms.
    } else if (term.tags.includes("Noun")) {
      let regex;
      if (complex.length) {
        complex = complex + term.text;
        regex = getAllNounForms(complex);
        complex = "";
      } else {
        regex = getAllNounForms(term);
      }
      finalArray.push(regex);
    // If the term is an adjective, generate regex patterns for all adjective forms.
    } else if (term.tags.includes("Adjective")) {
      let regex;
      if (complex.length) {
        complex = complex + term.text;
        regex = getAllAdjectiveForms(complex);
        complex = "";
      } else {
        regex = getAllAdjectiveForms(term);
      }
      finalArray.push(regex);
    // If the term is not a verb, noun, or adjective, simply add its text to the finalArray.
    } else {
      const word = term.text;
      finalArray.push(word);
    }
  }
  // Join the finalArray elements with spaces and replace multiple spaces with the "\s+", so regex patern if not dependent on number of spaces betwen words
  let finalRegex = finalArray.join(" ");
  finalRegex = finalRegex.replace(/\s+/gm, "\\s+");
  return finalRegex;
};
