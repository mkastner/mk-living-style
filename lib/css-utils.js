const csstree = require('css-tree');
const log = require('../lib/log');

// we need this for iteration over a loop
// to e.g. show modifications 
// in <div data-loop>...</div>
function extractSelectorNames(css, level = 0) {
  const ast = csstree.parse(css);
  const selectorsStack = [];
  const selectorLists = []; // eg. ['p red', 'p green']
  const typeSet = new Set();
  csstree.walk(ast, {
    enter(node, item, list) {
      if (node.type === 'TypeSelector') {
        // not needed
      }
      else if (node.type === 'ClassSelector') {
        typeSet.add(node.type); 
        selectorsStack.push(item.data.name); 
      }
      else if (node.type === 'PseudoClassSelector') {
        // not needed
      }
      else if (node.type === 'NestingSelector') {
        //typeSet.add(node.type);
        //selectorsStack.push(item.next.data.name); 
      }
    },
    leave(node) {
      if (typeSet.has(node.type)) {
        log.info('selectorsStack', selectorsStack);
        log.info('level', level);

        if (level === selectorsStack.length) {
          const joinedSelectorStack = selectorsStack.join(' ');
          log.info('joinedSelectorStack', joinedSelectorStack);
          selectorLists.push(joinedSelectorStack);
          log.info('selectorLists', selectorLists);
        }
        log.info('selectorsStack before pop', selectorsStack);
        selectorsStack.pop();
        log.info('selectorsStack after  pop', selectorsStack);
      }
    }
  });
  log.info('selectorLists', selectorLists);
  return selectorLists;
}

module.exports = { extractSelectorNames };

