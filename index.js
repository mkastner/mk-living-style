const extractStyleDocs = require('./lib/extract-style-docs');
const generateHTMLReport = require('./lib/generate-html-report');
const loadConfigFile = require('./lib/load-config-file');
const readline = require('readline');
const log = require('./lib/log');
const path = require('path');

const absoluteTemplatePath = path.join(__dirname, 'templates/default-template.hbs');
const StyleRootDefault = 'examples';

function getStyleRoot() {
  return new Promise((resolve, reject) => {
    let styleRoot = StyleRootDefault;
    if (process.env.STYLE_ROOT) {
      styleRoot = process.env.STYLE_ROOT;
      console.log(`env var STYLE_ROOT set: ${styleRoot}`);
      return resolve(styleRoot);
    } else {
      console.log(`env var STYLE_ROOT not set, suggested default: ${styleRoot}`);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(`Enter the path to your style root (default: ${styleRoot}): `,
        (styleRoot) => {
          rl.close();
          if (!styleRoot) {
            styleRoot = StyleRootDefault;
          }
          return resolve(styleRoot);
        });
    }
  });
}

(async () => {

  const styleRoot = await getStyleRoot();
  const config = await loadConfigFile();
  //log.info('Style root', styleRoot);
  const {docsList, docsTree, sortedDocsTree, cssFilePaths} = await extractStyleDocs(styleRoot);
  //log.info('Docs list', docsList); 
  //log.info('Docs tree', JSON.stringify(docsTree, null, 2));
  //log.info('CSS file paths', cssFilePaths);
  await generateHTMLReport(
    //'templates/default-template.hbs',
    absoluteTemplatePath,
    {
      docsList,
      docsTree: sortedDocsTree,
      outputPath: 'docs/style-doc.html',
      cssFilePaths: cssFilePaths,
    }
  );
})();
