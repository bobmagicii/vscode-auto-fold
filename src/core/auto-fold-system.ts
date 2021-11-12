import Module = require('module');
import * as vscode from 'vscode';
import Util from './util';

class AutoFoldSystem {
/*//
@date 2021-11-09
this is the primary management where all the decisions about what happens and
when it happens occur. an instance of this is created and managed by the
extension directly as its core interface.
//*/

	ext: vscode.ExtensionContext;
	api: typeof vscode;
	tracker: Map<string, boolean>;

	constructor(api: typeof vscode, ext: vscode.ExtensionContext) {
	/*//
	@date 2021-11-09
	//*/

		this.api = api;
		this.ext = ext;
		this.tracker = new Map;

		this.init();
		return;
	};

	private init():
	void {

		this.registerCommands();
		this.registerEvents();

		return;
	};

	private registerCommands() {

		let prefix = 'autofoldyeah';

		let binds = {
			'autoFold': this.onCommandFold.bind(this)
		};

		for(const item in binds) {
			Util.println(`register command: ${prefix}.${item}`);

			this.ext.subscriptions.push(
				this.api.commands.registerCommand(
					`${prefix}.${item}`,
					binds[item as keyof typeof binds]
				)
			);
		}

		return;
	};

	private registerEvents() {

		this.api.window.onDidChangeActiveTextEditor(
			this.onSwitchedEditors.bind(this)
		);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public fold():
	boolean {

		let editor = this.api.window.activeTextEditor;

		if(editor === undefined) {
			Util.println('nothing to fold','AutoFoldSystem::fold');
			return false;
		}

		////////

		if(!this.shouldFoldEditor(editor)) {
			Util.println(
				'this editor has already been folded or had folding disabled.',
				'AutoFoldSystem::fold'
			);

			return false;
		}

		////////

		let level = this.determineFoldLevel(editor);

		if(level === 0) {
			Util.println('no fold requested');
			return false;
		}

		////////

		// @todo 2021-11-12 unfold first if configured.

		this.api.commands.executeCommand(`editor.foldLevel${level}`);
		this.tracker.set(editor.document.uri.fsPath, true);

		this.api.window.setStatusBarMessage(`AutoFold Level ${level}`, 2000);

		return true;
	};

	public determineFoldLevel(editor: vscode.TextEditor) {

		let level = 0;

		if((level = this.getLevelFromMagicComment(editor)) > 0) {
			Util.println(`using magic comment fold at ${level}`);
			return level;
		}

		/*
		if((level = this.getLevelFromTypeConfig(editor)) > 0) {
			Util.println(`using type config fold at ${level}`);
			return level;
		}

		if((level = this.getLevelFromDefault(editor)) > 0) {
			Util.println(`using default fold at ${level}`);
			return level;
		}
		*/

		return level;
	};

	public getLevelFromMagicComment(editor: vscode.TextEditor):
	number {

		let types = [
			/fold-level=(\d+)/im,
			/vscode-fold=(\d+)/im // deprecated
		];

		let text = editor.document.getText();
		let result = null;

		for(const regex in types) {
			result = text.match(types[regex]);

			if(result !== null)
			return parseInt(result[1]);
		}

		return 0;
	};

	public shouldFoldEditor(editor: vscode.TextEditor):
	boolean {

		let path = editor.document.uri.fsPath;

		if(!this.tracker.has(path))
		return true;

		if(!this.tracker.get(path))
		return true;

		return false;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public onCommandFold():
	void {
	/*//
	@date 2021-11-09
	//*/

		Util.println('fold command');

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
