const vscode = require('vscode');
const languageConfigs = require('./languageConfig');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('toggle-comments.toggleLineComments', async function () {

    // const lineCommentString = languageConfigs.get('comments').lineComment;  // works
    let lineCommentString = languageConfigs.get('comments.lineComment');     // also works!
      // for languages like html that have no comments.lineComment
    if (!lineCommentString) lineCommentString = languageConfigs.get('comments.blockComment');
    // if still no lineCommentString, dump a notification  to user

    let lengthCommentCharacters = lineCommentString.length;

    // "editor.comments.insertSpace": false/true/undefined if no setting (default is true)
    const commentSpaceSetting = await vscode.workspace.getConfiguration().get('editor.comments.insertSpace');
    if (commentSpaceSetting || commentSpaceSetting === undefined) lengthCommentCharacters += 1

    let editor = vscode.window.activeTextEditor;
    let selections = editor.selections;

    for (const selection of selections) {

      if (selection.isEmpty || selection.isSingleLine) {
        await vscode.commands.executeCommand('editor.action.commentLine');
        return;
      }

      let numLines = Math.abs(selection.end.line - selection.start.line) + 1;
      let start = selection.start.line;

      let range = editor.document.lineAt(start).range;
      editor.selection =  new vscode.Selection(range.start, range.end);  // move cursor to the start line of selection

      // from start line of selection to end line of selection
      for (let line = start; line < numLines + start; line++) {

        // move cursor to next line, but don't move first time
        if (line !== start) {
          await vscode.commands.executeCommand('cursorDown');
        }
        // vscode skips empty lines
        if (editor.document.lineAt(line).isEmptyOrWhitespace) continue;

        await vscode.commands.executeCommand('editor.action.commentLine');  // toggle line comment on each line
      }
    }

    let resetSelections = [];

    selections.forEach((selection, index) => {

      let startCharacter = selection.anchor.character;
      let endCharacter = selection.active.character;
      let leadingWhiteSpaceIndex;   // first non-whitespace character in line

      // no match if user selected an empty line as start line
      let leadingWhiteSpaceMatch = editor.document.lineAt(selection.anchor.line).text.match(/\S/);
      leadingWhiteSpaceIndex = leadingWhiteSpaceMatch ? leadingWhiteSpaceMatch.index : -1;

      if (startCharacter > leadingWhiteSpaceIndex) {

        if (!editor.document.lineAt(selection.anchor.line).isEmptyOrWhitespace) {

          // trimStart() remove whitespace from indented lines
          if (editor.document.lineAt(selection.anchor.line).text.trimStart().startsWith(lineCommentString)) {
            startCharacter += lengthCommentCharacters;
          }
          else {
            startCharacter -= lengthCommentCharacters;
            startCharacter = (startCharacter >= 0) ? startCharacter : 0;  // no negative values
          }
        }
      }

      leadingWhiteSpaceMatch = editor.document.lineAt(selection.active.line).text.match(/\S/);
      leadingWhiteSpaceIndex = leadingWhiteSpaceMatch ? leadingWhiteSpaceMatch.index : -1;

      if (endCharacter > leadingWhiteSpaceIndex) {

        if (!editor.document.lineAt(selection.active.line).isEmptyOrWhitespace) {

          // trimStart() remove whitespace from indented lines
          if (editor.document.lineAt(selection.active.line).text.trimStart().startsWith(lineCommentString)) {
            endCharacter += lengthCommentCharacters;
          }
          else {
            endCharacter -= lengthCommentCharacters;
            endCharacter = (endCharacter >=0 ) ? endCharacter : 0;
          }
        }
      }
      resetSelections[index] = new vscode.Selection(selection.anchor.line, startCharacter, selection.active.line, endCharacter);
    });

    // reset selections as vscode does
    vscode.window.activeTextEditor.selections = resetSelections;

	});

	context.subscriptions.push(disposable);
}
// exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}