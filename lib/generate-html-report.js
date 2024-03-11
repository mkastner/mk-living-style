const fs = require('fs');
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');
// const md = new MarkdownIt();
const log = require('./log.js');

const listPartialNavTree = `
<ol class="style-docs tree-nav">
  {{#each this}}
    <li><a href="#{{this.title}}">{{this.title}}</a>
      {{#if this.children}}
        <details>
          <summary></summary>
<!-- Recursive call must start at the beginning of the line -->
{{> listPartialNavTree this.children}}  <!-- Recursive call -->
        </details>
      {{/if}}
    </li>
  {{/each}}
</ol>
`;

const listPartialContentTree = `
<ol class="style-docs tree-content">
{{#each this}}
    <li id="{{this.title}}">
      <h3 class="title">
        {{this.title}}
      </h3>
      {{#if this.doc}}
        <div>{{{this.doc.example}}}</div>
<!-- pre must start at the beginning of the line -->
<pre><code class="language-css">{{this.doc.css}}</code></pre>
        <details>
          <summary>Show Example Code</summary>
<pre><code class="language-html">{{this.doc.example}}</code></pre>
        </details>
      {{/if}}
      {{#if this.children}}
{{> listPartialContentTree this.children}}  <!-- Recursive call -->
      {{/if}}
    </li>
  {{/each}}
</ol>
`;

// Register the partial with Handlebars
Handlebars.registerPartial('listPartialNavTree', listPartialNavTree);
Handlebars.registerPartial('listPartialContentTree', listPartialContentTree);

Handlebars.registerHelper('json', function(context) {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

Handlebars.registerHelper('log', function(context) {
  log.info('Handlebars log', context);
});


function generateHTMLReport(templatePath, { docsList, docsTree, outputPath, cssFilePaths }) {
  //log.info('Generating HTML report', docsList);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent, { preventIndent: true });

  // Convert markdown within examples to HTML
  docsList.forEach(doc => {
    // log.info('Converting markdown to HTML', doc.example);
    //doc.exampleHtml = md.render(doc.example);
    doc.exampleHtml = doc.example;
    // log.info('Converting markdown to HTML', doc.exampleHtml);
  });

  const html = template({ docsList, docsTree, cssFilePaths });

  fs.writeFileSync(outputPath, html);
}

module.exports = generateHTMLReport;

// Usage example:

//const templatePath = 'path/to/your/style-doc-template.hbs';
//const styleDocs = '' // the result from your style docs extractor ;
//const outputPath = 'path/to/your/output/report.html';


//generateHTMLReport(templatePath, styleDocs, outputPath);
