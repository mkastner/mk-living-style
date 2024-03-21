'use strict';
const fs = require('fs');
const path = require('path');
const log = require('./log');

const FONT_WEIGHT_MAP = Object.freeze({
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
});

function mapFontWeight(weight, fontsWeights = {}) {
  const fontWeightMap = Object.assign({}, FONT_WEIGHT_MAP, fontsWeights);
  return fontWeightMap[weight] || 400;
}

function parseFontFileName(fileName, fontsWeights = {}) {
  const filePattern = /^(.+)-(\w+)?\.(\w+)$/;
  const match = fileName.match(filePattern);

  if (!match) return null;

  const [, fontFamily, variation, format] = match;
  const weight = variation.replace('Italic', '') || 'Regular';
  const fontWeight = mapFontWeight(weight, fontsWeights);
  const fontStyle = variation.match(/Italic/) ? 'italic' : 'normal';
  const srcFormat = format;
  const srcLocal = fileName.slice(0, fileName.lastIndexOf('.')); // File name without extension

  return { fontFamily, fontWeight, fontStyle, srcFormat, srcLocal };
}

// config from load-config-file.js
async function loadFontsData(config = {}) {
  const directoryPath = config.fonts.path;
  const docsPath = path.join(process.cwd(), 'docs');
  const files = await fs.promises.readdir(directoryPath);
  const fonts = [];

  files.forEach(file => {
    const absoluteFilePath = path.join(directoryPath, file);
    const relativeFilePath = path.relative(docsPath, absoluteFilePath);
    const fontDetails = parseFontFileName(file, config.fonts.weights);
    
    if (fontDetails) {
      fontDetails.srcUrl = relativeFilePath.replace(/\\/g, '/'); // Ensure URL uses forward slashes
      fonts.push(fontDetails);
    }
  });

  return fonts;
}

module.exports = loadFontsData;

