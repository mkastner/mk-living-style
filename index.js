const extractStyleDocs = require('./lib/extract-style-docs');
const generateHTMLReport = require('./lib/generate-html-report');
const log = require('./lib/log');

(async () => {
  const styleDocs = await extractStyleDocs('examples');
  log.info('Style docs extracted', styleDocs);
  generateHTMLReport(
    'templates/default-template.hbs', {
    styleDocs: styleDocs.docs,
    outputPath: 'static/style-doc.html',
    cssFilePaths: styleDocs.cssFilePaths,
  }
  );
})();
