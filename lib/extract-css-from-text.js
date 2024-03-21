const log = require('./log');
// Purpose: Extract CSS from a string of text
// which might e.g. be a full javascript file or a snippet of HTML
// Example: extractCssFromText(`body { background-color: red; }`);
function extractCssFromText(text) {
  // s grabs all characters, including newlines
  const regexQuotesPattern = /(['"`])(.*?)\1/gms;
  const quotesMatchIterator = text.matchAll(regexQuotesPattern);
  const quotesMatch = [...quotesMatchIterator]; // Convert iterator to an array

  const cssContents = quotesMatch.reduce((accumulator, match) => {
    // Assuming match[2] contains the text between quotes
    const textBetweenQuotes = match[2];
    const cssMatch = textBetweenQuotes.match(/(styleDoc|<style|@media|@keyframes|@font-face|:hover|:before|:after|:active|:nth-child|:root|:host|color:|background:|background-color:|width:|height:|margin:|padding:|font-size:|font-weight:|border:|display:|position:|flex-direction:|justify-content:|align-items:|#[0-9A-Fa-f]{3,6})/);

    if (cssMatch) {
      accumulator.push(textBetweenQuotes); // Here, match[2] contains the text between quotes 
    }

    return accumulator;
  }, []);

  return cssContents;
}

module.exports = extractCssFromText;

