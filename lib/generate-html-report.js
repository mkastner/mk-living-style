const fs = require('fs');
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');
// const md = new MarkdownIt();
const log = require('./log.js');

const listPartialSource = `
<ul>
  {{#each this}}
    <li><a href="#{{this.title}}">{{this.title}}</a>
      {{#if this.children}}
        <details>
          <summary>open</summary>
          {{> listPartial this.children}}  <!-- Recursive call -->
        </details>
      {{/if}}
    </li>
  {{/each}}
</ul>
`;

// Register the partial with Handlebars
Handlebars.registerPartial('listPartial', listPartialSource);

Handlebars.registerHelper('json', function(context) {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

Handlebars.registerHelper('log', function(context) {
  log.info('Handlebars log', context);
});


function generateHTMLReport(templatePath, { docsList, docsTree, outputPath, cssFilePaths }) {
  //log.info('Generating HTML report', docsList);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  // Convert markdown within examples to HTML
  docsList.forEach(doc => {
    // log.info('Converting markdown to HTML', doc.example);
    //doc.exampleHtml = md.render(doc.example);
    doc.exampleHtml = doc.example;
    // log.info('Converting markdown to HTML', doc.exampleHtml);
  });

  const html = template({ docsList, docsTree: { children: [docsTree] }, cssFilePaths });

  fs.writeFileSync(outputPath, html);
}

module.exports = generateHTMLReport;

// Usage example:

//const templatePath = 'path/to/your/style-doc-template.hbs';
//const styleDocs = '' // the result from your style docs extractor ;
//const outputPath = 'path/to/your/output/report.html';


//generateHTMLReport(templatePath, styleDocs, outputPath);
