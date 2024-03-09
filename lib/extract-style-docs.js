const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

// Ensure the static directory exists
const outputDir = path.join(__dirname, 'static');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const styleDocRegex = /\/\** *styleDoc([\s\S]*?)\*\//g;
const inlineCssRegex = /<style[^>]*>([\s\S]*?)<\/style>/g; // For extracting inline CSS from HTML

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
  const titleMatch = block.match(/title:\s*(.+)/);
  const exampleMatch = block.match(/example:\s*([\s\S]*?)\s*\*\//);
  if (titleMatch && exampleMatch) {
    return {
      title: titleMatch[1].trim(),
      example: exampleMatch[1].trim(),
      css: '', // Placeholder for simplicity, as detailed parsing may vary
    };
  }
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
