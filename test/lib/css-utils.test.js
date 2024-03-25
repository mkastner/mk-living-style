const { test } = require('node:test');
const assert = require('assert');
const log = require('../../lib/log');
const { extractSelectorNames } = require('../../lib/css-utils');

test('css utils', async (_t) => {
  const css1 = `p.red.f { color: red; } p.green.e { color: green; }`;
  const css2 = `.wide { &.red { color: red; } &.green { color: green; } }`;
  const css3 = `.red { color: red; } .green { color: green; }`;
  const css4 = `p { &:hover, &.hover { color: red; } &:active, &.active { color: green; } }`;
  
  log.info('css1 extractSelectorNames', extractSelectorNames(css1, 0));
  log.info('css2 extractSelectorNames', extractSelectorNames(css2, 1));
  log.info('css3 extractSelectorNames', extractSelectorNames(css3, 1));
  log.info('css4 extractSelectorNames', extractSelectorNames(css4, 1));

  //assert.deepStrictEqual(extractSelectorNames(css1), ['p red', 'p green']);
  //assert.deepStrictEqual(extractSelectorNames(css2), ['p red', 'p green']);
  //assert.deepStrictEqual(extractSelectorNames(css3), ['red', 'green']);
  //assert.deepStrictEqual(extractSelectorNames(css4), ['p hover', 'p active']);
});


