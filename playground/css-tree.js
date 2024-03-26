const csstree = require('css-tree');
const log = require('../lib/log');

function handleRule(rule) {
  log.info('rule', rule);
  const selector = rule.selector;

  log.info('selector', selector);

  // Handle multiple top-level selectors
  if (selector.children.length > 1) {
    for (const child of selector.children) {
      const classSelectors = extractClassesFromSelector(child, []);
      topLevelClasses.push(...classSelectors);
    }

    // Handle nested selectors within a single top-level selector
  } else {
    const classSelectors = extractClassesFromSelector(selector.first, []);
    if (classSelectors.length > 0) {
      topLevelClasses.push(...classSelectors);
    }
  }
}

// level: stack length from which to gather classes
function buildNameList(rulesStack, level = 0) {
  if (rulesStack.length > level) {
    return [];
  }
  const nameList = rulesStack.map(node => { 
    const selector = csstree.generate(node.prelude);
    log.info('selector', selector);
  }); 
  return nameList;
}

// level: stack length from which to gather classes
function extractSelectors(css, level = 0) {
  const ast = csstree.parse(css);
  const rulesStack = [];
  log.info('ast', ast);
  csstree.walk(ast, {
    enter(node) {
      log.info('node type', node.type);
      if (node.type === 'Selector') {
        //const selector = produceAbsoluteSelector(node.prelude, rulesStack);
        // do something with a selector
        //log.info('node enter', node);
        const selector = csstree.generate(node.prelude);
        log.info('selector', selector);
        rulesStack.push(node);
        const nameList = buildNameList(rulesStack);
        //log.info('rulesStack length', rulesStack.length); 
        //log.info('rulesStack after push', rulesStack);
      }
    },
    leave(node) {
      if (node.type === 'Rule') {
        //log.info('node leave', node);
        rulesStack.pop();
        //log.info('rulesStack after pop', rulesStack);
      }
    }
  });
}



// Example usage
const css1 = `p.red { color: red; } p.green { color: green; }`;
const css2 = `p { &.red { color: red; } &.green { color: green; } }`;
const css3 = `.red { color: red; } .green { color: green; }`;
const css4 = `p { &:hover, &.hover { color: red; } &:active, &.active { color: green; } }`;

console.log(extractClasses(css1)); // Expected: ['p red', 'p green']
console.log(extractClasses(css2)); // Expected: ['p red', 'p green']
console.log(extractClasses(css3)); // Expected: ['red', 'green']
console.log(extractClasses(css4)); // Expected: ['p hover', 'p active']

