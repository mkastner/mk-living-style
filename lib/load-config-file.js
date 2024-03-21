const { promises: fs } = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const log = require('./log');
const mergeDeep = require('./merge-deep');
// Separately defined to enhance testability and reusability
const DEFAULT_CONFIG = {
  fonts: {
    path: process.cwd(),
    weights: {
      Thin: 100,
      ExtraLight: 200,
      UltraLight: 200,
      Light: 300,
      Regular: 400,
      Medium: 500,
      SemiBold: 600,
      DemiBold: 600,
      Bold: 700,
      ExtraBold: 800,
      UltraBold: 800,
      Black: 900,
      Heavy: 900
    } 
  }
};


async function tryReadConfig(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      if (filePath.endsWith('.json')) {
        const content = await fs.readFile(filePath, 'utf8');
        try { 
          return JSON.parse(content);
        }
        catch (e) {
          log.error('error', e);
          return null; 
        }
      } else if (filePath.endsWith('.js')) {
        const importedModule = await import(pathToFileURL(filePath).href);
        return importedModule.default ?? importedModule;
      }
    }
  } catch (error) {
    // log.error(`Error reading configuration file: ${filePath}`, error);
    // Log or handle specific errors if necessary
  }
  return null;
}

async function loadConfigFile(pattern = '.livingstylerc', defaults = {}) {
  let currentPath = defaults.startPath ?? process.cwd();
  const rootPath = path.parse(currentPath).root;

  while (currentPath !== rootPath) {

    const configFilePathJson = path.join(currentPath, `${pattern}.json`);
    const configFilePathJs = path.join(currentPath, `${pattern}.js`);
    // Attempt to read JSON configuration
    const configJson = await tryReadConfig(configFilePathJson);
    //if (configJson !== null) return { ...defaults, ...configJson };
    if (configJson !== null) return mergeDeep(DEFAULT_CONFIG, configJson, defaults);

    // Attempt to read JS configuration
    const configJs = await tryReadConfig(configFilePathJs);
    if (configJs !== null) return mergeDeep(DEFAULT_CONFIG, configJs, defaults);

    // Move up one directory level
    currentPath = path.dirname(currentPath);
  }

  // Return defaults if no configuration file was found
  return defaults;
}

module.exports = loadConfigFile;

/* Usage example
(async () => {
  const defaults = { 
    startPath: process.cwd(), 
    defaultSetting: true // Example default setting
  };
  const config = await findConfigFile(defaults);
  console.log(config);
})();
*/
