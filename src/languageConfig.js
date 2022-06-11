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
 * From the language configuration for the current file get the value of config argument
 * Usage: await languageConfigs.get(documentLanguageId, 'comments');
 *
 * @param {string} langID - the languageID of the desired language configuration
 * @param {string} config - the language configuration to get, e.g., 'comments.lineComment' or 'autoClosingPairs'
 *
 * @returns {Promise<any>} - string or array or null if can't be found
 */
exports.get = async function (langID, config) {
  
  if (_getLanguagesToSkip().includes(langID)) return null;

	let configArg;

	if (config && config.includes('.')) configArg = config.split('.');
	else configArg = config;

	let desiredConfig = null;  // return null default if can't be found

	var langConfigFilePath = null;

	for (const _ext of vscode.extensions.all) {
		if (
			_ext.packageJSON.contributes &&
			_ext.packageJSON.contributes.languages
		) {
			// Find language data from "packageJSON.contributes.languages" for the langID argument
			// don't filter if you want them all
			const packageLangData = _ext.packageJSON.contributes.languages.find(
				_packageLangData => (_packageLangData.id === langID)
			);
			// If found, get the absolute config file path
			if (!!packageLangData && packageLangData.configuration) {
				langConfigFilePath = path.join(
					_ext.extensionPath,
					packageLangData.configuration
				);
				break;
			}
		}
	}

	if (!!langConfigFilePath && fs.existsSync(langConfigFilePath)) {

		// the whole language config will be returned if config arg was the empty string ''
    desiredConfig = jsonc.parse(fs.readFileSync(langConfigFilePath).toString());

		if (Array.isArray(configArg)) {

			for (let index = 0; index < configArg.length; index++) {
				desiredConfig = desiredConfig[configArg[index] ];
			}
			return desiredConfig;
		}
		else if (config) return jsonc.parse(fs.readFileSync(langConfigFilePath).toString())[config];
		else return desiredConfig;
	}
	else return null;
};


// packageLangData =

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

//desiredConfig =

//{
//  comments: {
//    lineComment: "//",
//    blockComment: [
//      "/*",
//      "*/",
//    ],
//  },
//  brackets: [
//    [
//      "${",
//      "}",
//    ],
//    [
//      "{",
//      "}",
//    ],
//    [
//      "[",
//      "]",
//    ],
//    [
//      "(",
//      ")",
//    ],
//  ],
//  autoClosingPairs: [
//    {
//      open: "{",
//      close: "}",
//    },
//    {
//      open: "[",
//      close: "]",
//    },
//    {
//      open: "(",
//      close: ")",
//    },
//    {
//      open: "'",
//      close: "'",
//      notIn: [
//        "string",
//        "comment",
//      ],
//    },
//    {
//      open: "\"",
//      close: "\"",
//      notIn: [
//        "string",
//      ],
//    },
//    {
//      open: "`",
//      close: "`",
//      notIn: [
//        "string",
//        "comment",
//      ],
//    },
//    {
//      open: "/**",
//      close: " */",
//      notIn: [
//        "string",
//      ],
//    },
//  ],
//  surroundingPairs: [
//    [
//      "{",
//      "}",
//    ],
//    [
//      "[",
//      "]",
//    ],
//    [
//      "(",
//      ")",
//    ],
//    [
//      "'",
//      "'",
//    ],
//    [
//      "\"",
//      "\"",
//    ],
//    [
//      "`",
//      "`",
//    ],
//    [
//      "<",
//      ">",
//    ],
//  ],
//  autoCloseBefore: ";:.,=}])>` \n\t",
//  folding: {
//    markers: {
//      start: "^\\s*//\\s*#?region\\b",
//      end: "^\\s*//\\s*#?endregion\\b",
//    },
//  },
//  wordPattern: {
//    pattern: "(-?\\d*\\.\\d\\w*)|([^\\`\\~\\!\\%\\^\\&\\*\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>/\\?\\s]+)",
//  },
//  indentationRules: {
//    decreaseIndentPattern: {
//      pattern: "^((?!.*?/\\*).*\\*/)?\\s*[\\}\\]].*$",
//    },
//    increaseIndentPattern: {
//      pattern: "^((?!//).)*(\\{([^}\"'`/]*|(\\t|[ ])*//.*)|\\([^)\"'`/]*|\\[[^\\]\"'`/]*)$",
//    },
//    unIndentedLinePattern: {
//      pattern: "^(\\t|[ ])*[ ]\\*[^/]*\\*/\\s*$|^(\\t|[ ])*[ ]\\*/\\s*$|^(\\t|[ ])*[ ]\\*([ ]([^\\*]|\\*(?!/))*)?$",
//    },
//  },
//  onEnterRules: [
//    {
//      beforeText: {
//        pattern: "^\\s*/\\*\\*(?!/)([^\\*]|\\*(?!/))*$",
//      },
//      afterText: {
//        pattern: "^\\s*\\*/$",
//      },
//      action: {
//        indent: "indentOutdent",
//        appendText: " * ",
//      },
//    },
//    {
//      beforeText: {
//        pattern: "^\\s*/\\*\\*(?!/)([^\\*]|\\*(?!/))*$",
//      },
//      action: {
//        indent: "none",
//        appendText: " * ",
//      },
//    },
//    {
//      beforeText: {
//        pattern: "^(\\t|[ ])*[ ]\\*([ ]([^\\*]|\\*(?!/))*)?$",
//      },
//      previousLineText: {
//        pattern: "(?=^(\\s*(/\\*\\*|\\*)).*)(?=(?!(\\s*\\*/)))",
//      },
//      action: {
//        indent: "none",
//        appendText: "* ",
//      },
//    },
//    {
//      beforeText: {
//        pattern: "^(\\t|[ ])*[ ]\\*/\\s*$",
//      },
//      action: {
//        indent: "none",
//        removeText: 1,
//      },
//    },
//    {
//      beforeText: {
//        pattern: "^(\\t|[ ])*[ ]\\*[^/]*\\*/\\s*$",
//      },
//      action: {
//        indent: "none",
//        removeText: 1,
//      },
//    },
//    {
//      beforeText: {
//        pattern: "^\\s*(\\bcase\\s.+:|\\bdefault:)$",
//      },
//      afterText: {
//        pattern: "^(?!\\s*(\\bcase\\b|\\bdefault\\b))",
//      },
//      action: {
//        indent: "indent",
//      },
//    },
//  ],
//}