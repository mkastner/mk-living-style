const fs = require('fs');
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');
// const md = new MarkdownIt();
const log = require('./log.js');

function generateHTMLReport(templatePath, { styleDocs, outputPath, cssFilePaths }) {
  log.info('Generating HTML report', styleDocs);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  // Convert markdown within examples to HTML
  styleDocs.forEach(doc => {
    // log.info('Converting markdown to HTML', doc.example);
    //doc.exampleHtml = md.render(doc.example);
    doc.exampleHtml = doc.example;
    // log.info('Converting markdown to HTML', doc.exampleHtml);
  });

  const html = template({ docs: styleDocs, cssFilePaths });

  fs.writeFileSync(outputPath, html);
}

module.exports = generateHTMLReport;

/* Usage example:

const templatePath = 'path/to/your/style-doc-template.hbs';
const styleDocs = '' // the result from your style docs extractor ;
const outputPath = 'path/to/your/output/report.html';


generateHTMLReport(templatePath, styleDocs, outputPath);
*/
