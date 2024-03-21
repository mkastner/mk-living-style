const log = require('../log');
// Purpose: Helper functions for the application

function json(context) {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
}

function hbsLog(context) {
  log.info('Handlebars log', context);
}

module.export = { log: hbsLog, json};
