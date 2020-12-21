# Toggle Line Comments

Toggle line comments in a selection line-by-line, so that 

```javascript
const a = 12;
// const b = 13;
const c = 14;
```
becomes

```javascript
// const a = 12;
const b = 13;
// const c = 14;
```

If you used vscode's built-in &nbsp; `Toggle Line Comment` &nbsp; on the same selection, it would result in:

```javascript
// const a = 12;
// // const b = 13;
// const c = 14;
```

As you can see, the line comment in the middle line is not toggled off - another set of line comment characters is prepended instead.

------

## Requirements

You can run the command from the `Command Palette` without a selection or on an empty line in which case this extension will simply run vscode's built-in toggle line comment command which will give the expected result.  The label for the command which will appear in the `Command Palette` is &nbsp; **"Toggle Line Comments By Line in a Selection"**.

---------

## Features

Works on one or multiple selections.  See demo below.

Empty lines in a selection are not commented - same as vscode's built-in toggle line comment.

Just as vscode does, this extension will attempt to retain the exact selection boundaries that existed before the command was triggered.  Demo:

<br/>

<img src="https://github.com/ArturoDent/toggle-comments/blob/master/images/fullDemo1.gif?raw=true" width="400" height="200" alt="no title error message"/>

<br/>

------------------


## Extension Settings

This extension contributes one command:

* **`toggle-comments.toggleLineComments`**: **Toggle Line Comments By Line in a Selection**

This extension contributes the following default keybinding:

```jsonc
{
	"command": "toggle-comments.toggleLineComments",
	"key": "ctrl+alt+/",                  // these are the default keybindings 
	"mac": "cmd+alt+/",
	"when": "editorTextFocus && !editorReadonly"
}
```
<kbd>Ctrl or Cmd</kbd>+<kbd>Alt</kbd>+<kbd>/</kbd> is the default keybinding, but you can change that to whatever you wish.

* If you never want the built-in behaviour of `Toggle Line Comment` <kbd>Ctrl or Cmd</kbd>+<kbd>/</kbd>, you could just set this extension's  command keybinding to:

```jsonc
{
	"command": "toggle-comments.toggleLineComments",
	"key": "ctrl+/",                  // override the built-in default 'Toggle Line Comment' 
	"mac": "cmd+/",
	"when": "editorTextFocus && !editorReadonly"
}
```

-----------

## Known Issues

This extension only works on line comments, not block comments.

Many people may have their environment set up to append to the block comment characters one space via the setting `"editor.comments.insertSpace"` (default is enabled), so that

```javascript
const a = 12;
```

becomes 

```javascript
// const a = 12; - a space after //
```

rather than 

```javascript
//const a = 12;  - no space after //
```

That will respected by this extension, let me know if the selection boundaries are not reset to exactly where they were before. See the second demo above.

-----------

## Release Notes

* 0.1.0 - Initial Release  
* 0.2.0 - fixed start/emd of selection in leading whitespace 
* 0.2.5 - fixed null matches on empty lines 
* 0.3.0 - removed `editorHasSelection` from default keybinding  
* 0.3.5 - simplified checking setting for `"editor.comments.insertSpace"` 
* 0.3.6 - fixed for languages with no `comment.lineComment` defined in their language configuration 

-----------------------------------------------------------------------------------------------------------
