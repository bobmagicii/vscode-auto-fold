# [![nether.io](https://img.shields.io/badge/Auto%20Fold-%20Visual%20Studio%20Marketplace-007ACC.svg)](http://nether.io/)

This extension will automatically fold code when files are opened if a magic
comment is found.

	vscode-fold=#

It does not matter how you put that in your file. All that matters is that you
put it somewhere your project won't syntax error on it - so within a single
or multiline comment.

Automatic folding only happens when opened. If they are already open, they will
stay as you have them.

If you just added the magic comment to a file and want to fold it without
reloading it, or if at any time you want to re-fold a file as configured, you
can use the keyboard shortcut `alt+grave` or use the command pallete
`ctrl+shift+p` and typing `autofold`.

# Installation

Use the extension panel in Visual Studio Code, type Fold, find this, install it.

# Example: Javascript

![Javascript](images/example-js.png)

# Example: PHP

![Javascript](images/example-php.png)

# Changelogue

```
1.0.1 (2017-01-11)

- added autofold.default to configuration. it will autofold files that do not
  have vscode-fold in them to the value specified. default is 0, which is off.

- added keybinding alt+grave to refold file accorinding to its config.

- added statusbar message when auto folding that vanishes after 2sec.

- swap out editor error banners with silent ones because in reality nobody cares
  if you try and fold when you have no files open, i am sure.

1.0.0 (2017-01-10)

- Initial release.
```
