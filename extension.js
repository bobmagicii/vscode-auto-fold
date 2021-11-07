/*//
//// Auto Fold
//// Released under BSD 3-Clause
////
//// Bob Majdak Jr <bmajdak@php.net>
//// https://twitter.com/bobmagicii
////
//// This extension will check files for the magic string:
//// vscode-fold=# and if found, will automatically fold that file to the
//// specified level when it is opened.
////
//// vscode-fold=2
//*/

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class AutoFoldType {

	ext = null;
	level = 0;

	constructor({ext, level}) {
		this.ext = ext.toLowerCase();
		this.level = level;
		return;
	};
};

class AutoFoldState {

	auto = false;

	constructor(filename) {
		return;
	};
};

class AutoFoldConfig {

	default = 0;
	types = [];
	unfold = false;
	pack = true;
	delay = 0;
	debug = true;

	constructor(input) {

		// fill our properties from vscode.

		for(const key in this) {
			if(!key.match(/^_/))
			if(typeof input[key] !== 'undefined')
			this[key] = input[key];
		}

		// hydrate our file type definitions.

		if(Array.isArray(this.types))
		for(const key in this.types) {
			if(typeof this.types[key].ext === 'undefined')
			continue;

			if(typeof this.types[key].level === 'undefined')
			continue;

			this.types[key] = new AutoFoldType(this.types[key]);
		}

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	getType(filename) {

		let lowername = filename.toLowerCase();

		for(const key in this.types) {
			let pos = lowername.indexOf(this.types[key].ext);
			let off = lowername.length - this.types[key].ext.length;

			if(pos === off)
			return this.types[key];
		}

		return null;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	static FromWorkspaceConfig() {

		return new AutoFoldConfig(
			vscode
			.workspace
			.getConfiguration("autofold")
		);
	};

};

class AutoFoldManager {

	version = 200;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	config = null;
	files = {};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	constructor(afConfig) {
	/*//
	@return void
	//*/

		this.config = afConfig;

		AutoFoldManager.printDebug(
			'constructor',
			'AutoFoldManager is ready'
		);

		return;
	};

	fold(file) {
	/*//
	@return bool - if a fold happened or not.
	//*/


		let filename = AutoFoldManager.getFilenameFrom(file);
		let level = this.getLevel(file);
		let folded = false;

		if(level > 0) {
			if(this.config.unfold) {
				AutoFoldManager.printDebug('fold', 'unfolding all');
				vscode.commands.executeCommand('editor.unfoldAll');
			}

			AutoFoldManager.printDebug('fold', `folding ${filename} at ${level}`);
			vscode.commands.executeCommand(`editor.foldLevel${level}`);
			vscode.window.setStatusBarMessage(`AutoFold Level ${level}`, 2000);
			folded = true;
		}

		return folded;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	getLevel(file) {
	/*//
	@return int - the level this file should be folded to
	//*/

		let level = 0;

		////////

		if(level === 0)
		level = this.getLevelFromFile(file);

		if(level === 0)
		level = this.getLevelForType(file);

		if(level === 0)
		level = this.getLevelDefault();

		////////

		return level;
	};

	getLevelFromFile(file) {
	/*//
	@return int - the level this file wants to be folded to
	//*/

		let level = 0;
		let data = file.getText();

		// for some reason this getText is not returning the actual
		// text in the editor even tho that is the contents of the file
		// on disk and in ram.

		let magic = [
			/(fold-file)=(\d+)/m,
			/(vscode-fold)=(\d+)/m
		];

		////////

		for(const key in magic) {
			let result = data.match(magic[key]);
			//console.log(magic[key]);

			if(result !== null) {
				console.log(result);
				level = result[1];
				break;
			}
		}

		if(level > 0)
		AutoFoldManager.printDebug(
			'getLevelFromFile',
			`found magic comment level ${level}`
		);

		return level;
	};

	getLevelForType(file) {
	/*//
	@return int - the level this type of file should be folded to
	//*/

		let filename = AutoFoldManager.getFilenameFrom(file);
		let type = this.config.getType(filename);
		let level = 0;

		if(type !== null) {
			level = type.level;
		}

		if(level > 0)
		AutoFoldManager.printDebug(
			'getLevelForType',
			`using ${type.ext} at ${type.level}`
		);

		return level;
	};

	getLevelDefault() {
	/*//
	@return int - the default level this should be folded to.
	//*/

		return this.config.default;
	};

	getFileState(filename) {
	/*//
	@return AutoFoldState
	//*/

		if(typeof this.files[filename] === 'undefined')
		this.files[filename] = new AutoFoldState;

		return this.files[filename];
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onCommandFold() {
	/*//
	@return void
	//*/

		return;
	};

	onFileOpen(file) {
	/*//
	@return void
	//*/

		let filename = file.uri.toString();
		let state = this.getFileState(filename);

		AutoFoldManager.printDebug('onFileOpen', `filename: ${filename}`);

		// if this file has not been automatically folded yet then
		// do so now. vscode emits file open and close events every time
		// you switch tabs and we only want it to happen when the file is
		// first opened.

		this.fold(file);

		return;
	};

	onFileClose(file) {
	/*//
	@return void
	//*/

		let filename = AutoFoldManager.getFilenameFrom(file);

		if(this.config.debug)
		AutoFoldManager.printDebug(
			'onFileClose',
			`filename: ${filename}`
		);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	static getFilenameFrom(input) {

		// for some dumb dipshit reason vscode emits two events for
		// every single file you open, one proper and one with the string
		// ".git" added to the end so until they explain wtf they doing
		// we just gonna strip it.

		if(typeof input.uri === 'object')
		return input.uri.fsPath.replace(/\.git$/,'');

		return input;
	};

	static printDebug(source, message) {

		console.log(`[AutoFoldManager.${source}] ${message}`);
		return;
	};

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

let vscode = require('vscode');
let afConfig = AutoFoldConfig.FromWorkspaceConfig();
let afSystem = new AutoFoldManager(afConfig);

exports.activate = function(context) {

	context
	.subscriptions
	.push(vscode.commands.registerCommand(
		'extension.autofold',
		afSystem.onCommandFold.bind(afSystem)
	));

	vscode
	.workspace
	.onDidOpenTextDocument(
		afSystem.onFileOpen.bind(afSystem),
		null,
		context
	);

	vscode
	.workspace
	.onDidCloseTextDocument(
		afSystem.onFileClose.bind(afSystem),
		null,
		context
	);

	return;
};

exports.deactivate = function() {

	return;
};

