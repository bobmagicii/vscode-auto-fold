import * as vscode from 'vscode';
import Util from './util';

class AutoFoldSystem {

	public OnSwitchedEditors(editor: vscode.TextEditor | undefined):
	void {

		if(editor === undefined) {
			Util.println('OnSwitchedEditors: none');
			return;
		}

		Util.println(`OnSwitchedEditors: ${editor.document.uri.fsPath}`);

		return;
	};

};

export default AutoFoldSystem;
