const nlp = require("compromise");

// Function to create an array of regular expressions based on a given input.
const createRegexes = async (input) => {
  const regexes = [];
  for (i in input) {
    // Use natural language processing (nlp) to parse the input
    const doc = nlp(input[i]);
    // Convert the parsed data to JSON
    const data = doc.json();
    // Create a regex from the terms in the parsed data
    let regex = createRegex(data[0].terms);
    // If the input includes a space, modify the regex to account for different tenses
    if (input[i].includes(" ")) {
      regex = diferentTimes(regex, input[i]);
    }
    // Add boundary conditions to the regex
    regex = `(\\s+|^)${regex}(\\s+|$|(\\.|\\!|\\?))`;
    // Add the regex to the array of regexes
    regexes.push(regex);
  }
  return regexes;
};

// Function to create a regex that matches different tenses of a given input
const diferentTimes = (regex, input) => {
  const versions = [];
  // Create versions of the regex for past, present, future, and infinitive tenses
  const past = nlp(input).sentences().toPastTense().text();
  if (past !== input) {
    versions.push(`(${past.replace(/\s+/gm, "\\s+")})`);
  }
  const present = nlp(input).sentences().toPresentTense().text();
  if (present !== input) {
    versions.push(`(${present.replace(/\s+/gm, "\\s+")})`);
  }
  const future = nlp(input).sentences().toFutureTense().text();
  if (future !== input) {
    versions.push(`(${future.replace(/\s+/gm, "\\s+")})`);
  }
  const infinitive = nlp(input).sentences().toInfinitive().text();
  if (infinitive !== input) {
    versions.push(`(${infinitive.replace(/\s+/gm, "\\s+")})`);
  }
  // If there are any versions, modify the original regex to include them
  if (versions.length) {
    regex = `(${regex}|${versions.join("|")})`;
  }
  return regex;
};

// Function to create a regular expression based on a given set of terms
const createRegex = (terms) => {
  const finalArray = [];
  // Variable to store a shortcut version of the regex
  let shortCut = "";
  // Variable to store a complex version of the regex
  let complex = "";

  for (let i in terms) {
    const term = terms[i];
    // Check if the term has a postfix and it's not a space
    if (term.post && term.post !== " ") {
      // Add the postfix to the complex version
      complex = term.text + term.post;
    } else if (term.tags.includes("Verb")) {
      // If the term is a verb, get all its forms and add them to the regex
      let regex;
      if (complex.length) {
        // If there is a complex term, add the current term text and get its forms
        complex = complex + term.text;
        regex = getAllVerbForms(complex);
        complex = "";
      } else {
        // If there is no complex term, just get the verb forms of the current term
        regex = getAllVerbForms(term);
      }
      // If there's a shortcut version, add the verb forms to it and reset it
      if (shortCut.length) {
        shortCut = `${shortCut}${regex}))`;
        finalArray.push(shortCut);
        shortCut = "";
      } else {
        // Otherwise, just add the verb forms to the regex
        finalArray.push(regex);
      }
      // If the term is a noun that includes an apostrophe, create a shortcut version of the regex
    } else if (term.tags.includes("Noun") && term.text.includes("'")) {
      shortCut = `((${term.text})|(`;
      const regex = getAllNounForms(term);
      shortCut = `${shortCut}${regex}\\s+`;
      // If the term is a noun without apostrophe, get all its forms and add them to the regex
    } else if (term.tags.includes("Noun")) {
      let regex;
      // If there is a complex term, add the current term text and get its forms
      if (complex.length) {
        complex = complex + term.text;
        regex = getAllNounForms(complex);
        complex = "";
        // If there is no complex term, just get the noun forms of the current term
      } else {
        regex = getAllNounForms(term);
      }
      finalArray.push(regex);
      // If the term is an adjective, get all its forms and add them to the regex
    } else if (term.tags.includes("Adjective")) {
      let regex;
      // If there is a complex term, add the current term text and get its forms
      if (complex.length) {
        complex = complex + term.text;
        regex = getAllAdjectiveForms(complex);
        complex = "";
      } else {
        regex = getAllAdjectiveForms(term);
      }
      finalArray.push(regex);
    } else {
      // If the term is not a verb, noun, or adjective, add it to the regex as it is
      const word = term.text;
      finalArray.push(word);
    }
  }
  // Join the parts of the regex into a single string and replace multiple spaces with a single space
  let finalRegex = finalArray.join(" ");
  finalRegex = finalRegex.replace(/\s+/gm, "\\s+");
  return finalRegex;
};

// Function to get all forms of a given verb
const getAllVerbForms = (term) => {
  let word;
  // If the term is a string, just use it as the word. Otherwise, use the implicit form of the term if it exists or use the text of the term. Also, convert to lower case.
  if (typeof term === "string") {
    word = term;
  } else {
    word = term.implicit
      ? term.implicit.toLowerCase()
      : term.text.toLowerCase();
  }
  const wordForms = [];
  // Add the original word to the forms
  wordForms.push(word);
  // Get the infinitive form of the word
  const infinitive = nlp(word).verbs().toInfinitive().text().toLowerCase();
  // If the infinitive form exists and it's not already in the forms array, add it. If infinitive doesn't exist, then it is not a verb and other forms also doesn't exits
  if (infinitive) {
    if (!wordForms.includes(infinitive)) {
      wordForms.push(infinitive);
    }
    // Get the past tense of the word
    const past = nlp(word).verbs().toPastTense().all().text().toLowerCase();
    // If the past tense is not already in the forms array, add it
    if (!wordForms.includes(past)) {
      wordForms.push(past);
    }
    // Get the present tense of the word
    const present = nlp(word)
      .verbs()
      .toPresentTense()
      .all()
      .text()
      .toLowerCase();
    // If the present tense is not already in the forms array, add it
    if (!wordForms.includes(present)) {
      wordForms.push(present);
    }
    // Get the future tense of the word
    const future = nlp(word).verbs().toFutureTense().all().text().toLowerCase();
    // If the future tense is not already in the forms array, add it
    if (!wordForms.includes(future)) {
      wordForms.push(future);
    }
    // Get the gerund form of the word
    const gerund = nlp(word)
      .verbs()
      .toGerund()
      .all()
      .text()
      .toLowerCase()
      .replace("is ", "((am|is|are) )?");
    // If the gerund form is not already in the forms array, add it
    if (!wordForms.includes(gerund)) {
      wordForms.push(gerund);
    }
  }
  // Join the forms into a string with a '|' (OR) separator to form the final regex
  const regex = `(${wordForms.join("|")})`;
  return regex;
};

// Function to get all forms of a given noun
const getAllNounForms = (term) => {
  let word;
  // If the term is a string, just use it as the word. Otherwise, use the implicit form of the term if it exists or use the text of the term. Also, convert to lower case.
  if (typeof term === "string") {
    word = term;
  } else {
    word = term.implicit
      ? term.implicit.toLowerCase()
      : term.text.toLowerCase();
  }
  const wordForms = [];
  // Add the original word to the forms
  wordForms.push(word);
  // Check if the word is plural
  if (nlp(word).nouns().isPlural().length) {
    // Get the singular form of the word
    const singular = nlp(word).nouns().toSingular().all().text().toLowerCase();
    // If the singular form is not already in the forms array, add it
    if (!wordForms.includes(singular)) {
      wordForms.push(singular);
    }
  } else {
    // Get the plural form of the word
    const plural = nlp(word).nouns().toPlural().all().text().toLowerCase();
    // If the plural form is not already in the forms array, add it
    if (!wordForms.includes(plural)) {
      wordForms.push(plural);
    }
  }
  // Join the forms into a string with a '|' (OR) separator to form the final regex
  const regex = `(${wordForms.join("|")})`;
  return regex;
};

// Function to get all forms of a given adjective
const getAllAdjectiveForms = (term) => {
  let word;
  // If the term is a string, just use it as the word
  if (typeof term === "word") {
    word = term;
  }
  // Use the normal form of the term if it exists, otherwise use the text of the term. Also, convert to lower case
  word = term.normal ? term.normal.toLowerCase() : term.text.toLowerCase();
  const wordForms = [];
  // Add the original word to the forms
  wordForms.push(word);
  // Get the comparative form of the word
  const comparative = nlp(word)
    .adjectives()
    .toComparative()
    .all()
    .text()
    .toLowerCase();
  // If the comparative form is not already in the forms array, add it
  if (!wordForms.includes(comparative)) {
    wordForms.push(comparative);
  }
  // Get the superlative form of the word
  const superlative = nlp(word)
    .adjectives()
    .toSuperlative()
    .all()
    .text()
    .toLowerCase();
  // If the superlative form is not already in the forms array, add it
  if (!wordForms.includes(superlative)) {
    wordForms.push(superlative);
  }
  // Get the adverb form of the word
  const adverb = nlp(word).adjectives().toAdverb().all().text().toLowerCase();
  // If the adverb form is not already in the forms array, add it
  if (!wordForms.includes(adverb)) {
    wordForms.push(adverb);
  }
  // Join the forms into a string with a '|' (OR) separator to form the final regex
  const regex = `(${wordForms.join("|")})`;
  return regex;
};

module.exports = {
  createRegexes,
};
