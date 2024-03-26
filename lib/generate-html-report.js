const fs = require('fs');
const Handlebars = require('handlebars');
const helpers = require('./handlebars/helpers');
// const MarkdownIt = require('markdown-it');
// const md = new MarkdownIt();
const log = require('./log.js');
const loadConfigFile = require('./load-config-file');
const loadFontsData = require('./load-fonts-data');

const listPartialNavTree = `
<ol class="style-docs tree-nav">
  {{#each this}}
    <li>
    <a href="#{{this.fullTitle}}" title="{{this.fullTitle}}">{{this.title}} {{this.doc.order}}</a>
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
    <li id="{{this.fullTitle}}">
      <h3 class="title">
        <span>{{this.fullTitle}} {{this.doc.order}}</span>
        <a href="#page-top" title="Go Top" class="go-top">&uarr;</a>
      </h3>
      {{#if this.doc}}
        {{#if this.doc.description}}
          <p class="style-docs description">
            {{{this.doc.description}}}
          </p>
        {{/if}}
        <div {{#if this.doc.namespace}}class="{{{this.doc.namespace}}}"{{/if}}>
          {{{this.doc.example}}}
        </div>
<!-- pre must start at the beginning of the line -->
        <details class="style-docs details">
          <summary class="style-docs summary">Show Style Definition</summary>
<pre><code class="language-css">{{this.doc.css}}</code></pre>
        </details>
        <details class="style-docs details">
          <summary class="style-docs summary">Show Example Code</summary>
<pre><code class="language-html">{{this.doc.example}}</code></pre>
           <p class="style-docs p">Source: <a class="style-docs tree-content a" href="../{{this.doc.filePath}}#{{this.doc.startLine}}">{{this.doc.filePath}}:{{this.doc.startLine}}</a></p>
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

Object.keys(helpers).forEach(key => {
  Handlebars.registerHelper(key, helpers[key]);
});

async function generateHTMLReport(templatePath, { docsList, docsTree, outputPath, cssFilePaths }) {
  const config = await loadConfigFile();
  const fontData = await loadFontsData(config);
  //log.info('Generating HTML report', docsList);
  const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent, { preventIndent: true });

  // Convert markdown within examples to HTML
  docsList.forEach(doc => {
    // log.info('Converting markdown to HTML', doc.example);
    //doc.exampleHtml = md.render(doc.example);
    doc.exampleHtml = doc.example;
    // log.info('Converting markdown to HTML', doc.exampleHtml);
  });

  const html = template({ docsList, docsTree, cssFilePaths, fontData });

  fs.writeFileSync(outputPath, html);
}

module.exports = generateHTMLReport;

// Usage example:

//const templatePath = 'path/to/your/style-doc-template.hbs';
//const styleDocs = '' // the result from your style docs extractor ;
//const outputPath = 'path/to/your/output/report.html';


//generateHTMLReport(templatePath, styleDocs, outputPath);
