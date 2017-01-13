# [![https://marketplace.visualstudio.com/items?itemName=bobmagicii.autofoldyeah](https://img.shields.io/badge/Auto%20Fold-%20Visual%20Studio%20Marketplace-007ACC.svg)](https://marketplace.visualstudio.com/items?itemName=bobmagicii.autofoldyeah)

This extension will automatically fold code when files are opened if a magic comment is found or if configured in the user or workspace config. Additionally default folding levels can be defined in the user or workspace config on a per file extension basis.

	vscode-fold=#

It does not matter how you put that in your file. All that matters is that you put it somewhere your project won't syntax error on it - so within a single or multiline comment.

Automatic folding only happens when opened. If they are already open, they will stay as you have them - unless that was the first time you switched to that tab since starting vscode cause then it will still fold it.

If you just added the magic comment to a file and want to fold it without reloading it, or if at any time you want to re-fold a file as configured, you can use the keyboard shortcut `alt+grave` or use the command pallete `ctrl+shift+p` and typing `autofold`.

# Installation

Use the extension panel in Visual Studio Code, type Fold, find this, install it.

# Configuration

## `autofold.types`

This defines DEFAULT folding levels based on the file extension of the file. We only check this if the file did not specifically ask with a magic comment. This option takes an array of objects which contain two properties. The property "ext" should be a string which defines the file extension you want to match. I suggest including the dot. It should handle files with multiple dots fine too. The property "level" should be an integer describing which level you want to fold to.

They match top down taking the first one that says yes, notice how the two PHP one, `.php` and `.conf.php` are stacked to get the desired behaviour of falling back.

```json
"autofold.types": [
	{ "ext": ".js", "level": 1 },
	{ "ext": ".c", "level": 1 },
	{ "ext": ".cs", "level": 2 },
	{ "ext": ".conf.php", "level": 1 },
	{ "ext": ".php", "level": 2 }
]
```

## `autofold.default`

You can fold all files without magic comments or specific settings in `autofold.types` by default by setting this in either your user or workspace configuration. Default value is 0, which disables auto folding of files that do not ask for it.

```json
"autofold.default": 0
```

## `autofold.unfold`

Automatically unfold files before folding them, default enabled. This will help keep behaviour consistent with various folding levels. If you have a file that was remembered as having a hodgepodge of folded levels, this will unfold everything before folding to the level that file asked for. Recommended you leave it enabled.

```json
"autofold.unfold": true
```

# Keybindings

## `extension.autofold`

You can change this keybinding in your keybindings config. The default is alt+grave (the `, same key as ~) and it will re-fold the file to the level that the file asks to be folded at.

# Example: Javascript

![Javascript](images/example-js.png)

# Example: PHP

![Javascript](images/example-php.png)

# Known Issues

Just like if you use the normal hot keys without this extension, the block where the cursor is will not be folded, even though everything else will. Considering adding an option to move the cursor out.

# Changelogue

```
1.0.3 (2017-01-13)

- clean up debugging and optimise mostly. maybe be slightly snappier, though it already was decent.

1.0.2 (2017-01-12)

- added option `autofold.types` to define defaults based on file extension.

- added option `autofold.unfold` to unfold files fully before folding at the requested level.

1.0.1 (2017-01-11)

- added autofold.default to configuration. it will autofold files that do not have vscode-fold in them to the value specified. default is 0, which is off.

- added keybinding alt+grave to refold file according to its config.

- added statusbar message when auto folding that vanishes after 2sec.

- swap out editor error banners with silent ones because in reality nobody cares if you try and fold when you have no files open, i am sure.

1.0.0 (2017-01-10)

- Initial release.
```
