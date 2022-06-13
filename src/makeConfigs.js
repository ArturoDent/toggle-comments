const vscode = require('vscode');
const jsonc = require("jsonc-parser");
const fs = require('fs');
const path = require('path');


/**
 * Get an array of "languages", like plaintext, that don't have comment syntax
 * @returns {string[]} 
 */
function _getLanguagesToSkip  () {
  return ['log', 'Log', 'search-result', 'plaintext', 'scminput', 'properties', 'csv', 'tsv', 'excel'];
}

/**
 * Get and make all the language configuration json files
 * @param {vscode.ExtensionContext} context
 * @param {string} extConfigDirectory - 
 */
exports.build = async function (context, extConfigDirectory) {
  
  const commentObj = {};

  if (!fs.existsSync(extConfigDirectory)) fs.mkdirSync(extConfigDirectory,{ recursive: true });

  let langConfigFilePath = null;

  for (const _ext of vscode.extensions.all) {
    if (_ext.packageJSON.contributes && _ext.packageJSON.contributes.languages) {
      
      const contributedLanguages = _ext.packageJSON.contributes.languages;  // may be an array

      contributedLanguages.forEach((/** @type {{ id: string; }} */ packageLang, /** @type {number} */ index) => {

        // "languages" to skip, like plaintext, etc. = no configuration properties that we are interested in
        let skipLangs = _getLanguagesToSkip();

        if (!skipLangs?.includes(packageLang.id) && _ext.packageJSON.contributes.languages[index].configuration) {

          langConfigFilePath = path.join(
            _ext.extensionPath,
            _ext.packageJSON.contributes.languages[index].configuration
          );
          
          if (!!langConfigFilePath && fs.existsSync(langConfigFilePath)) {
            const thisConfig = jsonc.parse(fs.readFileSync(langConfigFilePath).toString());
            commentObj[packageLang.id] = thisConfig.comments;
          }
        }
      });
    }
  }
  if (Object.entries(commentObj).length) {
    const destPath = path.join(extConfigDirectory, `comments.json`);
    fs.writeFileSync(destPath, JSON.stringify(commentObj), { flag: 'w' });
  }
  return commentObj;
};


// thisConfig =

//{
//  id: "javascript",
//  aliases: [
//    "JavaScript",
//    "javascript",
//    "js",
//  ],
//  extensions: [
//    ".js",
//    ".es6",
//    ".mjs",
//    ".cjs",
//    ".pac",
//  ],
//  filenames: [
//    "jakefile",
//  ],
//  firstLine: "^#!.*\\bnode",
//  mimetypes: [
//    "text/javascript",
//  ],
//  configuration: "./javascript-language-configuration.json",
//}