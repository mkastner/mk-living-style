const { test, describe } = require('node:test');
const assert = require('assert');
const extractCssFromText = require('../../lib/extract-css-from-text');
const log = require('../../lib/log');

describe('extractCssFromText function', () => {
  test('should correctly extract CSS from text with backticks', () => {
    const input = '`body { background-color: red; }`';
    const expected = ['body { background-color: red; }'];
    const actual = extractCssFromText(input);
    log.info('actual', actual);
    assert.deepStrictEqual(actual, expected);
  });

  test('should correctly extract CSS style from text with backticks', () => {
    const input = `\`<style></style>\``;
    log.info('input', input);
    const expected = [`<style></style>`];
    const actual = extractCssFromText(input);
    assert.deepStrictEqual(actual, expected);
  });

  test('should correctly extract CSS from text with single quotes', () => {
    const input = `'body { background-color: blue; }'`;
    const expected = [`body { background-color: blue; }`];
    const actual = extractCssFromText(input);
    assert.deepStrictEqual(actual, expected);
  });

  test('should correctly extract CSS from text with double quotes', () => {
    const input = `"body { background-color: green; }"`;
    const expected = [`body { background-color: green; }`];
    const actual = extractCssFromText(input);
    assert.deepStrictEqual(actual, expected);
  });

  test('should correctly extract multiline CSS from a class definition using backticks', () => {
    const input = `class WebCompontent extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
      connectedCallback() {
        this.shadowRoot.innerHTML = \`<style>
          /** styleDoc - Red Heading
          <h1>Hello World</h1>
          */
          h1 {
            color: red;
          }
        </style>
        <h1>Hello World</h1>\`;
      }
    }`;

    const expected = [`<style>
          /** styleDoc - Red Heading
          <h1>Hello World</h1>
          */
          h1 {
            color: red;
          }
        </style>
        <h1>Hello World</h1>`];
    const actual = extractCssFromText(input);
    assert.deepStrictEqual(actual, expected);
  });
});

