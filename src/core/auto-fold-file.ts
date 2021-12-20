import Module = require('module');
import * as vscode from 'vscode';
import Util from './util';

class AutoFoldFile {

	path: string|null = null;
	folded: boolean = false;

	// @todo 2021-12-20 other properties about the state of the folding for
	// this file to be added. for example if a user just wants a file to
	// never ever fold. or if regions were folded. etc.

	constructor(editor: vscode.TextEditor, folded: boolean) {

		this.path = editor.document.uri.fsPath;
		this.folded = folded;

		return;
	};

};

export default AutoFoldFile;