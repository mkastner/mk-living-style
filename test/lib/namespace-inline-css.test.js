// namespaceCss.test.js
const test = require('node:test');
const assert = require('assert');
const namespaceCss = require('../../lib/namespace-inline-css');

// Run tests on the namespaceCss function
test('namespaceCss function', async (t) => {
  await t.test('should return unmodified CSS text when "no-namespace" is present', () => {
    const inputCss = '// no-namespace\n.example { color: red; }';
    const result = namespaceCss(inputCss, '/path/to/myfile.css');
    assert.strictEqual(result, inputCss);
  });

  await t.test('should namespace CSS correctly without <style> tags', () => {
    const inputCss = ':host { display: flex; }';
    const expectedResult = '.myfile { display: flex; }';
    const result = namespaceCss(inputCss, '/path/to/myfile.css');
    assert.strictEqual(result, expectedResult);
  });

  await t.test('should namespace CSS correctly with <style> tags', () => {
    const inputCss = '<style>:root { background-color: blue; }</style>';
    const expectedResult = '.myfile { background-color: blue; }';
    const result = namespaceCss(inputCss, '/path/to/myfile.css');
    assert.strictEqual(result, expectedResult);
  });
});

