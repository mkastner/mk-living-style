const fs = require('fs');
const path = require('path');
const fastGlob = require('fast-glob');
const extractCssFromText = require('./extract-css-from-text');
const namespaceInlineCss = require('./namespace-inline-css');
const log = require('./log');
const { extractSelectorNames } = require('./css-utils');

// Ensure the static directory exists
const outputDir = 'docs';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}



//const styleDocRegex = /\/\** *styleDoc([\s\S]*?)\*\//g;
const styleDocRegex = /\/\*\* *styleDoc([\s\S]*?)\*\/([\s\S]*?)(?=(\r?\n *\r?\n)|<\/style>)/gm;
//const inlineCssRegex = /<style[^>]*>([\s\S]*?)<\/style>/g; // For extracting inline CSS from HTML

function extractCssVariable(cssLine) {

  // log.info('cssLine', cssLine);

  const cssVariableRegex = /^.*?(--.*?):/;

  const match = cssLine.match(cssVariableRegex);

  if (match) {
    let name = match[0].trim(); // Trim to remove any leading/trailing whitespace
    name = name.substring(0, name.length - 1).trim(); // Remove the trailing '{' and trim again
    // Optionally remove any leading . or # from class or ID selectors
    name = name.replace(/^[.#]/, '');
    return name.trim();
  }
}

function processLoopingElements(exampleContent, cssLines = []) {
  // Find elements with data-loop and replace [item] with lines from cssContent
  const loopRegex = /<[^>]*data-loop[^>]*>[\s\S]*?<\/[^>]+>/g;
  let match;
  let processedContent = exampleContent;
  //const cssLines = cssContent.split('\n').filter(line => line.trim() !== '');

  while ((match = loopRegex.exec(exampleContent)) !== null) {
    log.info('exampleContent', exampleContent);
    let replacement = '';
    // Don't mix vars with selectors
    // replacemnt is only added if there are cssLines
    // matched variables are applied line by line 
    cssLines.forEach(cssLine => {
      const cssVariable = extractCssVariable(cssLine);
      //log.info('cssVariable', cssVariable);
      if (cssVariable) {
        replacement += match[0].replace(/\[cssName\]/g, cssVariable) + '\n';
      } 
    });

    log.info('replacement', replacement);

    // matched selectors are applied to the entire block 
    const joinedLines = cssLines.join('\n');
    const extractedSelectors = extractSelectorNames(joinedLines);
    extractedSelectors.forEach(selector => {
      replacement += match[0].replace(/\[cssName\]/g, selector) + '\n';
    });
    //}
    processedContent = processedContent.replace(match[0], replacement.trim());
  }

  return processedContent;
}


function buildNestedTree(docsList) {
  // Sort docsList by title to ensure the hierarchy is correct
  docsList.sort((a, b) => a.title.localeCompare(b.title));

  const root = { children: [], title: 'Root' }; // Root node

  docsList.forEach(doc => {
    const parts = doc.title.split(' ');
    let current = root;
    parts.forEach((part, index) => {
      let node = current.children.find(child => child.title === part);
      if (!node) {
        //log.info('doc.title', doc.title);
        //log.info('part     ', part); 
        node = { title: part, fullTitle: parts.slice(0, index + 1).join(' '), children: [], doc: null };
        current.children.push(node);
      }
      if (index === parts.length - 1) {
        node.doc = doc; // Attach the full doc to the last node
      }
      //log.info('node', node);
      current = node;
    });
  });

  //log.info('Root', JSON.stringify(root, null, 2));

  return root;
}

function removeExcessIntent(text) {
  const splittedText = text.split('\n');
  const lastLine = splittedText[splittedText.length - 1];
  const matchedIndent = lastLine.match(/^\s+/);
  if (!matchedIndent) {
    return text;
  }
  const regex = new RegExp(`^${matchedIndent[0]}`);
  const resultText = splittedText.map(line => line.replace(regex, '')).join('\n');
  return resultText; 
}

async function extractStyleDocs(dir) {

  const docsList = []; // the list of styleDoc objects
  const cssFilePaths = new Set();
  const inlineCssSet = new Set();
  const ignoreFilePatterns = [];

  if (fs.existsSync(path.join(process.cwd(), '.styledocignore'))) {
    const ignoreFile = fs.readFileSync(path.join(process.cwd(), '.styledocignore'), 'utf-8');
    ignoreFilePatterns.push(...ignoreFile.split('\n').filter(line => line.trim() !== ''));
  }

  const files = await fastGlob(path.join(dir, '**/*.{js,css,scss,html,hbs,handlebars}'), {
    ignore: ignoreFilePatterns,
  });

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('no-style-doc')) {
      // TODO: Add Test
      log.info(`Skipping ${filePath} because it contains 'no-style-doc'`);
      continue;
    }
    const ext = path.extname(filePath);

    let outputElementNamespace;
    if (ext === '.css' || ext === '.scss') {
      cssFilePaths.add(filePath); // Collect unique .css file paths
    } else {
      // Extract and cumulate inline CSS from non-stylesheet files

      // only embedded CSS files require namespacing
      outputElementNamespace = filePath.split('/').pop().split('.').shift();
      extractCssFromText(content).forEach(cssContent => {
        // split the content by </style> to remove any artifacts like HTML tags
        const removedArtifactsCss = cssContent.split(/(<\/style>)/)[0]; 
        const namespacedInlineCss = namespaceInlineCss(removedArtifactsCss, outputElementNamespace);
        inlineCssSet.add(namespacedInlineCss); // Avoid redundancies by using a Set
      });
    }

    // log.info(`Extracting styleDoc from ${filePath}`);

    // Parse for /** styleDoc comments
    while ((match = styleDocRegex.exec(content)) !== null) {
      const startLine = content.substring(0, match.index).split(/\r?\n/).length;
      const docObj = parseStyleDoc(match[0]);
      if (docObj.css) { 
         docObj.css = removeExcessIntent(docObj.css);
      };
      if (docObj.example) { 
         docObj.example = removeExcessIntent(docObj.example);
      };
      // log.info(`Found styleDoc ****** in ${filePath}`);
      // log.info(`Parsed styleDoc from ${filePath}`, docObj); 
      if (docObj) {
        docsList.push({
          namespace: outputElementNamespace,
          ...docObj,
          filePath,
          startLine,
        });
      }
    }
  }

  // Save cumulated inline CSS to a file
  if (inlineCssSet.size > 0) {

    const inlineCssContent = Array.from(inlineCssSet).join('\n');
    fs.writeFileSync(path.join(process.cwd(), 'docs', 'inline.css'), inlineCssContent, 'utf-8');
    cssFilePaths.add('docs/inline.css');
  }

  const docsTree = buildNestedTree(docsList);

  return { docsList, docsTree, cssFilePaths: Array.from(cssFilePaths) };
}

function parseStyleDoc(block) {
  const titleMatch = block.match(/\/\*\* *styleDoc *-? *([^\n]+)/);
  let parsedData = {
    title: '',
    description: '',
    example: '',
    css: ''
  };

  if (titleMatch) {
    parsedData.title = titleMatch[1].trim();
    const parts = block.split('*/');
    if (parts.length > 1) {
      // Everything after the styleDoc block
      const afterBlock = parts[1].trim();
      const lines = afterBlock.split('\n');
      let cssLines = [], isCSSStarted = false;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Start capturing CSS after encountering non-comment, non-empty line
        if (!isCSSStarted && line.trim() !== '') {
          isCSSStarted = true;
        }

        // If CSS started and we hit an empty/blank line, stop capturing
        if (isCSSStarted && line.trim() === '') {
          break;
        }

        if (isCSSStarted) {
          cssLines.push(line);
        }
      }

      // Process description and example from the first part
      const descriptionAndExample = parts[0].split('\n').slice(1); // Remove title line
      let isExample = false;
      const descriptionLines = [], exampleLines = [];

      descriptionAndExample.forEach(line => {
        if (line.trim().startsWith('<')) {
          isExample = true;
        }
        if (isExample) {
          exampleLines.push(line);
        } else {
          descriptionLines.push(line);
        }
      });

      // Populate parsedData object
      if (descriptionLines.length > 0) {
        parsedData.description = descriptionLines.join('\n').trim();
      } else {
        delete parsedData.description;
      }

      if (exampleLines.length > 0) {
        // Remove the potential trailing */
        let exampleText = exampleLines.join('\n').trim();
        if (exampleText.endsWith('*/')) {
          exampleText = exampleText.substring(0, exampleText.length - 2).trim();
        }
        parsedData.example = exampleText;
      } else {
        delete parsedData.example;
      }

      if (cssLines.length > 0) {
        parsedData.css = cssLines.join('\n').trim();
      } else {
        delete parsedData.css;
      }

      parsedData.example = processLoopingElements(parsedData.example, cssLines);

    }
  }

  return titleMatch ? parsedData : null;
}


module.exports = extractStyleDocs;
