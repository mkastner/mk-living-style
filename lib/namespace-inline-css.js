const path = require('path');
const log = require('./log');

function namespaceInlineCss(cssText, outputElementNamespace) {
  // Early return for 'no-namespace'
  if (cssText.includes('no-namespace')) {
    return cssText;
  }

  // Remove <style> tags and store the result in a new constant
  const cssWithoutStyleTags = cssText.replace(/<style>|<\/style>/g, '');

  let namespacedCss;


  // Check for :host or :root in the CSS
  if (/:host|:root/.test(cssWithoutStyleTags)) {
    // Replace :host and :root with .[filename] and assign to namespacedCss
    // log.info('cssWithoutStyleTags', cssWithoutStyleTags);

    namespacedCss = cssWithoutStyleTags.replace(/:host/g, `.${outputElementNamespace}`);
    //log.info('namespacedCss', namespacedCss);
  } else {
    // Nest CSS within .[filename] class if no :host or :root present and assign to namespacedCss
    namespacedCss = `.${outputElementNamespace} { ${cssWithoutStyleTags} }`;
  }

  return namespacedCss;
}

module.exports = namespaceInlineCss;
 
