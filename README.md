> This is the new branch that is getting rewritten.
>
> * Try to solve the various issues people found over time.
> * Typescript.
>  * Better Engineering.

Auto Fold for Visual Studio Code
================================================================================

This extension allows you to configure multiple methods for automatically
folding a file when opened.



Method 1: Magic Comment
--------------------------------------------------------------------------------

The most simple way to get a file folding is to add a magic comment containing
the `"fold-level=n"` where `n` is an integer ranging from 0 to 9. All that
matters is that it is added to the file in a way that will not cause you syntax
or compile errors.

**C, PHP, JS, etc:**
> `// fold-level=2`

**Bash**
> `# fold-level=2`

**SQL**
> `-- fold-level=2`

*Note: The old version comment `vscode-fold` is still supported but considered
deprecated. You should migrate to the `fold-level` version because people had
expressed it making plugins for other editors to reuse these.*




Method 2: Configured By File Type
--------------------------------------------------------------------------------

> TODO




Method 3: Configured Default
--------------------------------------------------------------------------------

> TODO




Other Options
--------------------------------------------------------------------------------

> TODO: Auto Fold All Block Comments
> executeCommand('editor.foldAllBlockComments')
> https://github.com/bobmagicii/vscode-auto-fold/issues/21

> TODO: Auto Fold All Marker Regions
> executeCommand('editor.foldAllMarkerRegions')
> https://github.com/bobmagicii/vscode-auto-fold/issues/19

> TODO: Only Auto Fold Files Longer Than n Lines
> https://github.com/bobmagicii/vscode-auto-fold/issues/7
