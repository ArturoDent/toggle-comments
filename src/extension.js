const vscode = require('vscode');
const languageConfigs = require('./languageConfig');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

  // // const lineCommentString = languageConfigs.get('comments').lineComment;  // works
  // const lineCommentString = languageConfigs.get('comments.lineComment');     // works!

	let disposable = vscode.commands.registerCommand('toggle-comments.toggleLineComments', async function () {

    // const lineCommentString = languageConfigs.get('comments').lineComment;  // works
    const lineCommentString = languageConfigs.get('comments.lineComment');     // also works!

    let lengthCommentCharacters;

    let editor = vscode.window.activeTextEditor;
    // let selection = editor.selection;
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
    
      // from start line of selction to end line of selection
      for (let line = start; line < numLines + start; line++) {
    
        // move cursor to next line, but don't move first time
        if (line !== start) {
          await vscode.commands.executeCommand('cursorDown');
        }
        // vscode skips empty lines
        if (editor.document.lineAt(line).isEmptyOrWhitespace) continue;

        if (!lengthCommentCharacters) {
          let compareText = editor.document.lineAt(line).text;
          await vscode.commands.executeCommand('editor.action.commentLine');
          lengthCommentCharacters = Math.abs(compareText.length - editor.document.lineAt(line).text.length);
        }
        else await vscode.commands.executeCommand('editor.action.commentLine');  // toggle line comment on each line
      }
    }

    let resetSelections = [];

    selections.forEach((selection, index) => {

      let startCharacter = selection.anchor.character;
      let endCharacter = selection.active.character;

      if (!editor.document.lineAt(selection.anchor.line).isEmptyOrWhitespace) {

        if (editor.document.lineAt(selection.anchor.line).text.startsWith(lineCommentString)) {
          // some settings have a space automatically added after comment characters (check that setting?)
          startCharacter += lengthCommentCharacters;
        }
        else {
          startCharacter -= lengthCommentCharacters;
          startCharacter = (startCharacter >= 0) ? startCharacter : 0;
        }
      }

      if (!editor.document.lineAt(selection.active.line).isEmptyOrWhitespace) {

        if (editor.document.lineAt(selection.active.line).text.startsWith(lineCommentString)) {
          endCharacter += lengthCommentCharacters;
        }
        else {
          endCharacter -= lengthCommentCharacters;
          endCharacter = (endCharacter >=0 ) ? endCharacter : 0;
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
