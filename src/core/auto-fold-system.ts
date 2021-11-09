import * as vscode from 'vscode';
import Util from './util';

class AutoFoldSystem {
/*//
@date 2021-11-09
this is the primary management where all the decisions about what happens and
when it happens occur. an instance of this is created and managed by the
extension directly as its core interface.
//*/

	constructor() {
	/*//
	@date 2021-11-09
	//*/

		Util.println(
			'Auto Fold System Initialized',
			'AutoFoldSystem::constructor'
		);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public fold():
	boolean {

		let editor = vscode.window.activeTextEditor;

		if(editor === undefined) {
			Util.println('nothing to fold','AutoFoldSystem::fold');
			return false;
		}

		Util.println(
			'TODO: fold the visible document',
			'AutoFoldSystem::fold'
		);

		// ...

		return true;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public onCommandFold():
	void {
	/*//
	@date 2021-11-09
	//*/

		this.fold();
		return;
	};

	public onSwitchedEditors(editor: vscode.TextEditor | undefined):
	void {
	/*//
	@date 2021-11-09
	//*/

		if(editor === undefined) {
			Util.println('OnSwitchedEditors: none');
			return;
		}

		Util.println(`OnSwitchedEditors: ${editor.document.uri.fsPath}`);
		this.fold();

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

};

export default AutoFoldSystem;
