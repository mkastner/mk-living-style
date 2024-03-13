const path = require('path');

function logMessage(level, message, ...args) {
  const err = new Error();
  const stack = err.stack.split('\n');
  
  // Start looking further down the stack to bypass the logging function's own calls
  // You might need to adjust this index depending on the call stack's structure
  let callerLine = '';
  for (let i = 2; i < stack.length; i++) {
    if (!stack[i].includes('log.js')) {
      callerLine = stack[i];
      break;
    }
  }
  
  const match = callerLine.match(/\((.*?):(\d+):(\d+)\)$/);
  if (match) {
    const [, file, line, column] = match;
    const fileName = path.basename(file);

    console.log(`[${level}] ${fileName}:${line} -`, message, ...args);
  } else {
    console.log(`[${level}]`, message, ...args);
  }
}

module.exports = {
  info: (...args) => logMessage('INFO', ...args),
  debug: (...args) => logMessage('DEBUG', ...args),
  warn: (...args) => logMessage('WARN', ...args),
  error: (...args) => logMessage('ERROR', ...args),
};

