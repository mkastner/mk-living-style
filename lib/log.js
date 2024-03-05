const path = require('path');

// General logging function
function logMessage(level, message, ...args) {
  const err = new Error();
  const stack = err.stack.split('\n');

  // Adjusting this index might be necessary depending on the environment
  const callerLine = stack[2] || '';
  
  // Extracting the file name and line number from the stack trace
  const match = callerLine.match(/\((.*?):(\d+):(\d+)\)$/);
  if (match) {
    const [, file, line, column] = match;
    const fileName = path.basename(file);

    // Log the message with file name, line number, and log level
    console.log(`[${level}] ${fileName}:${line} -`, message, ...args);
  } else {
    // Fallback in case the stack trace format is not as expected
    console.log(`[${level}]`, message, ...args);
  }
}

// Exporting log methods for different levels
module.exports = {
  info: (...args) => logMessage('INFO', ...args),
  debug: (...args) => logMessage('DEBUG', ...args),
  warn: (...args) => logMessage('WARN', ...args),
  error: (...args) => logMessage('ERROR', ...args),
};

