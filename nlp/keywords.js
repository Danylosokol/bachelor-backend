const nlp = require("compromise");


const createRegexes = async (input) => {
  const regexes = [];
  for (i in input) {
    const doc = nlp(input[i]);
    const data = doc.json();
    console.log("DAta:");
    console.log(data);
    let regex = createRegex(data[0].terms);
    if (input[i].includes(" ")) {
      regex = diferentTimes(regex, input[i]);
    }
    regex = `(\\s+|^)${regex}(\\s+|$|(\\.|\\!|\\?))`;
    regexes.push(regex);
  }
  return regexes;
};

const diferentTimes = (regex, input) => {
  const versions = [];
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
  if(versions.length){
    regex = `(${regex}|${versions.join("|")})`
  }
  return regex;
};

const createRegex = (terms) => {
  const finalArray = [];
  let shortCut = "";
  let complex = "";
  for (let i in terms) {
    const term = terms[i];
    console.log(term);
    if (term.post && term.post !== " ") {
      complex = term.text + term.post;
    } else if (term.tags.includes("Verb")) {
      let regex;
      if (complex.length) {
        complex = complex + term.text;
        regex = getAllVerbForms(complex);
        complex = "";
      } else {
        regex = getAllVerbForms(term);
      }
      if (shortCut.length) {
        shortCut = `${shortCut}${regex}))`;
        finalArray.push(shortCut);
        shortCut = "";
      } else {
        finalArray.push(regex);
      }
    } else if (term.tags.includes("Noun") && term.text.includes("'")) {
      shortCut = `((${term.text})|(`;
      const regex = getAllNounForms(term);
      shortCut = `${shortCut}${regex}\\s+`;
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
    } else {
      const word = term.text;
      finalArray.push(word);
    }
  }
  let finalRegex = finalArray.join(" ");
  finalRegex = finalRegex.replace(/\s+/gm, "\\s+");
  return finalRegex;
};

const getAllVerbForms = (term) => {
  let word;
  if (typeof term === "string") {
    word = term;
  } else {
    word = term.implicit
      ? term.implicit.toLowerCase()
      : term.text.toLowerCase();
  }
  const wordForms = [];
  wordForms.push(word);
  const infinitive = nlp(word).verbs().toInfinitive().text().toLowerCase();
  if (infinitive) {
    if (!wordForms.includes(infinitive)) {
      wordForms.push(infinitive);
    }
    const past = nlp(word).verbs().toPastTense().all().text().toLowerCase();
    if (!wordForms.includes(past)) {
      wordForms.push(past);
    }
    const present = nlp(word)
      .verbs()
      .toPresentTense()
      .all()
      .text()
      .toLowerCase();
    if (!wordForms.includes(present)) {
      wordForms.push(present);
    }
    const future = nlp(word).verbs().toFutureTense().all().text().toLowerCase();
    if (!wordForms.includes(future)) {
      wordForms.push(future);
    }
    const gerund = nlp(word)
      .verbs()
      .toGerund()
      .all()
      .text()
      .toLowerCase()
      .replace("is ", "((am|is|are) )?");
    if (!wordForms.includes(gerund)) {
      wordForms.push(gerund);
    }
  }
  const regex = `(${wordForms.join("|")})`;
  return regex;
};

const getAllNounForms = (term) => {
  let word;
  if (typeof term === "string") {
    word = term;
  } else {
    word = term.implicit
      ? term.implicit.toLowerCase()
      : term.text.toLowerCase();
  }
  const wordForms = [];
  wordForms.push(word);
  if (nlp(word).nouns().isPlural().length) {
    const singular = nlp(word).nouns().toSingular().all().text().toLowerCase();
    if (!wordForms.includes(singular)) {
      wordForms.push(singular);
    }
  } else {
    const plural = nlp(word).nouns().toPlural().all().text().toLowerCase();
    if (!wordForms.includes(plural)) {
      wordForms.push(plural);
    }
  }
  const regex = `(${wordForms.join("|")})`;
  return regex;
};

const getAllAdjectiveForms = (term) => {
  let word;
  if (typeof term === "word") {
    word = term;
  }
  word = term.normal ? term.normal.toLowerCase() : term.text.toLowerCase();
  const wordForms = [];
  wordForms.push(word);
  const comparative = nlp(word)
    .adjectives()
    .toComparative()
    .all()
    .text()
    .toLowerCase();
  if (!wordForms.includes(comparative)) {
    wordForms.push(comparative);
  }
  const superlative = nlp(word)
    .adjectives()
    .toSuperlative()
    .all()
    .text()
    .toLowerCase();
  if (!wordForms.includes(superlative)) {
    wordForms.push(superlative);
  }
  const adverb = nlp(word).adjectives().toAdverb().all().text().toLowerCase();
  if (!wordForms.includes(adverb)) {
    wordForms.push(adverb);
  }
  const regex = `(${wordForms.join("|")})`;
  return regex;
};

module.exports = {
  createRegexes,
};
