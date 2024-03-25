const csstree = require('css-tree');

function extractSelectorNames(css) {
  const ast = csstree.parse(css);
  const selectorMap = new Map(); // Use a map to group selectors by their blocks

  csstree.walk(ast, {
    enter(node) {
      if (node.type === 'Rule' && node.block && node.block.children) {
        let currentSelectors = [];
        csstree.walk(node.prelude, {
          enter(selectorNode) {
            if (selectorNode.type === 'ClassSelector') {
              currentSelectors.push(selectorNode.name); // Push class names without dots
            }
          }
        });

        if (currentSelectors.length > 0) {
          const joinedSelectors = currentSelectors.join(' ');
          const declarations = csstree.generate(node.block);
          if (!selectorMap.has(declarations)) {
            selectorMap.set(declarations, []);
          }
          selectorMap.get(declarations).push(joinedSelectors);
        }
      }
    }
  });

  const result = [];
  for (const [block, selectors] of selectorMap) {
    result.push(...selectors);
  }

  return result;
}

module.exports = { extractSelectorNames };

