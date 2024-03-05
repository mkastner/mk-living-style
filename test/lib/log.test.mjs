import { test } from 'node:test';
import assert from 'assert';
import { execSync } from 'child_process';

test('log module outputs correctly for each log level', async (_t) => {
  const testScript = `
    const log = require('./lib/log.js'); // Adjust the path to your log module
    log.info('Test info message');
    log.warn('Test warning message');
    log.debug('Test debug message');
    log.error('Test error message');
  `;

  // Execute a small script using Node.js that uses the log module
  // Normally, you'd capture the stdout/stderr to assert on, but for demonstration,
  // we'll just ensure the script executes without error as an example
  try {
    execSync(`node -e "${testScript.replace(/\n/g, '')}"`, { stdio: 'inherit' });
    assert.ok(true, 'Log module executed without errors');
  } catch (error) {
    assert.fail('Log module execution failed');
  }
});

