const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const log = require("./log");

// Ensure the static directory exists
const outputDir = path.join(__dirname, 'static');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

//const styleDocRegex = /\/\** *styleDoc([\s\S]*?)\*\//g;
const styleDocRegex = /\/\*\* *styleDoc([\s\S]*?)\*\/([\s\S]*?)(?=\r?\n\r?\n)/g;
const inlineCssRegex = /<style[^>]*>([\s\S]*?)<\/style>/g; // For extracting inline CSS from HTML

function extractCssSelector(cssLine) {
  const cssSelectorRegex = /^(.*?)\{|^.*?(--.*?):/;

  const match = cssLine.match(cssSelectorRegex);
   
  if (match) {
    let name = match[0].trim(); // Trim to remove any leading/trailing whitespace
    name = name.substring(0, name.length - 1).trim(); // Remove the trailing '{' and trim again
    // Optionally remove any leading . or # from class or ID selectors
    name = name.replace(/^[.#]/, '');
    log.info('name', name); 
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
    let replacement = '';
    cssLines.forEach(cssLine => {
      log.info('-------------cssLine', cssLine);
      const cssSelector = extractCssSelector(cssLine); 
      log.info('-------------cssSelector', cssSelector);
      replacement += match[0].replace(/\[item\]/g, cssSelector) + '\n';
    });
    processedContent = processedContent.replace(match[0], replacement.trim());
  }

  return processedContent;
}


function buildNestedTree(docsList) {
  // Sort docsList by title to ensure the hierarchy is correct
  docsList.sort((a, b) => a.title.localeCompare(b.title));

  const root = { children: [], title: "Root" }; // Root node

  docsList.forEach(doc => {
    const parts = doc.title.split(' ');
    let current = root;
    parts.forEach((part, index) => {
      let node = current.children.find(child => child.title === part);
      if (!node) {
        node = { title: part, children: [], doc: null };
        current.children.push(node);
      }
      if (index === parts.length - 1) {
        node.doc = doc; // Attach the full doc to the last node
      }
      current = node;
    });
  });

  return root;
}


async function extractStyleDocs(dir) {
  const docsList = [];
  const cssFilePaths = new Set();
  const inlineCssSet = new Set();

  const files = await fg(path.join(dir, "**/*.{js,css,scss,html,hbs,handlebars}"));

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath);

    if (ext === '.css' || ext === '.scss') {
      cssFilePaths.add(filePath); // Collect unique .css file paths
    } else {
      // Extract and cumulate inline CSS from non-stylesheet files
      let match;
      while ((match = inlineCssRegex.exec(content)) !== null) {
        inlineCssSet.add(match[1].trim()); // Avoid redundancies by using a Set
      }
    }

    // Parse for /** styleDoc comments
    while ((match = styleDocRegex.exec(content)) !== null) {
      const startLine = content.substring(0, match.index).split(/\r?\n/).length;
      const docObj = parseStyleDoc(match[0]);
      if (docObj) {
        docsList.push({
          ...docObj,
          filePath,
          startLine,
        });
      }
    }
  }

  // Save cumulated inline CSS to a file
  if (inlineCssSet.size > 0) {
    const inlineCssContent = Array.from(inlineCssSet).join("\n\n");
    fs.writeFileSync(path.join(outputDir, 'inline.css'), inlineCssContent, 'utf-8');
  }

  const docsTree = buildNestedTree(docsList);

  return { docsList, docsTree, cssFilePaths: Array.from(cssFilePaths) };
}

function parseStyleDoc(block) {
  log.info('block', block);
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
        log.info('cssLines', cssLines);
      }

      // Process description and example from the first part
      let descriptionAndExample = parts[0].split('\n').slice(1); // Remove title line
      let isExample = false;
      let descriptionLines = [], exampleLines = [];

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
        log.info('parsedData.css', parsedData.css);
      } else {
        delete parsedData.css;
      }

      parsedData.example = processLoopingElements(parsedData.example, cssLines);

    }
  }

  return titleMatch ? parsedData : null;
}


module.exports = extractStyleDocs;

// Example usage
/*
(async () => {
  const directoryPath = 'path/to/your/directory';
  const { docs, docsTree, cssFilePaths } = await extractStyleDocs(directoryPath);

  console.log(docs);
  console.log(docsTree); // Log the nested tree structure
  console.log(cssFilePaths); // Log collected CSS file paths
  })();
*/
