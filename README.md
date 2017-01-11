# Features

This extension will automatically fold code when files are opened if a magic
comment is found.

	vscode-fold=#

It does not matter how you put that in your file. All that matters is that you
put it somewhere your project won't syntax error on it - so within a single
or multiline comment.

Automatic folding only happens when opened. If they are already open, they will
stay as you have them.

If you just added the magic comment to a file and want to fold it without
reloading it, or if at any time you can re-fold a file as configured using the
keyboard shortcut `alt+grave` or by using the command pallete `ctrl+shift+p`
and typing `autofold`.

# Example: Javascript

![Javascript](images/example-js.png)

# Example: PHP

![Javascript](images/example-php.png)

# Changelogue

```
1.0.0 (2017-01-10)
- Initial release.
```
