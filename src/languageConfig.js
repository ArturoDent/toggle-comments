const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @description - from the language configuration for the current file
 * @despcription - get the value of config argument
 * 
 * @param {any} config - the language configuration to get, e.g., 'comments.lineComment' or 'autoClosingPairs'
 * @returns {any} - string or array or null if can't be found
 */
exports.get = function (config) {

  // if pass in no config ?
  if (config.includes('.')) config = config.split('.');

  let desiredConfig = null;

  // for language of current editor
  const editor = vscode.window.activeTextEditor;
  const documentLanguageId = editor.document.languageId;
  var langConfigFilepath = null;

  for (const _ext of vscode.extensions.all) {
    // All vscode default extensions ids starts with "vscode."
    if (
      _ext.id.startsWith("vscode.") &&
      _ext.packageJSON.contributes &&
      _ext.packageJSON.contributes.languages
    ) {
      // Find language data from "packageJSON.contributes.languages" for the 
      // current file's languageId (or just use them all and don't filter here
      const packageLangData = _ext.packageJSON.contributes.languages.find(
        _packageLangData => (_packageLangData.id === documentLanguageId)
      );
      // If found, get the absolute config file path
      if (!!packageLangData) {
        langConfigFilepath = path.join(
          _ext.extensionPath,
          packageLangData.configuration
        );
        break;
      }
    }
  }

  // Validate config file existence
  if (!!langConfigFilepath && fs.existsSync(langConfigFilepath)) {
    // let langConfig = require(langConfigFilepath);
    // let aCPs = langConfig.autoClosingPairs; // if you prefer/can use this route

    // or use this
    // desiredConfig = JSON.parse(fs.readFileSync(langConfigFilepath).toString()).comments;
    desiredConfig = JSON.parse(fs.readFileSync(langConfigFilepath).toString())[`${ config[0] }`][`${ config[1] }`];
    
    // if config is null, didn't pass anything in or
    // for length of config array, add [`${config[index]}`] to end

  };
  return desiredConfig;
}