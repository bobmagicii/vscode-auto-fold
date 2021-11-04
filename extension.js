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

	filename = null;
	auto = false;

	constructor(filename) {
		this.filename = filename;
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

		this.config = afConfig;

		AutoFoldManager.printDebug(
			'constructor',
			'AutoFoldManager is ready'
		);

		return;
	};

	fold(filename) {
	/*//
	@return bool - if a fold happened or not.
	//*/

		let level = this.getLevel(filename);
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

	getLevel(filename) {
	/*//
	@return int - the level this file should be folded to
	//*/

		let level = 0;

		if(level === 0)
		level = this.getLevelForType(filename);

		if(level === 0)
		level = this.getLevelDefault();

		return level;
	};

	getLevelFromFile() {
	/*//
	@return int - the level this file wants to be folded to
	//*/

		return 0;
	};

	getLevelForType(filename) {
	/*//
	@return int - the level this type of file should be folded to
	//*/

		let type = this.config.getType(filename);

		if(type !== null) {
			AutoFoldManager.printDebug(
				'getLevelForType',
				`using ${type.ext} ${type.level}`
			);

			return type.level;
		}

		return 0;
	};

	getLevelDefault() {
	/*//
	@return int - the default level this should be folded to.
	//*/

		return this.config.default;
	};

	getFileState(filename) {

		if(typeof this.files[filename] === 'undefined')
		this.files[filename] = new AutoFoldState(filename);

		return this.files[filename];
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onCommandFold() {

		return;
	};

	onFileOpen(file) {

		let filename = AutoFoldManager.getFilenameFrom(file);
		let state = this.getFileState(filename);

		AutoFoldManager.printDebug('onFileOpen', `filename: ${filename}`);

		// if this file has not been automatically folded yet then
		// do so now. vscode emits file open and close events every time
		// you switch tabs and we only want it to happen when the file is
		// first opened.

		if(state.auto === false)
		state.auto = this.fold(filename);

		return;
	};

	onFileClose(file) {

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
		// every single file you open, with the same filepath, but with
		// this stupid .git added to the end. until i figure out why that
		// made sense to them we're just gonna strip that right off.

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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

return;

class _AutoFoldingSystem {

	version = 107;

	Debug = true;


	Files = [];
	Interval = 0;

	Has(File) {

		let Iter = 0;

		for(Iter = 0; Iter < AutoFoldTracker.Files.length; Iter++)
		if(AutoFoldTracker.Files[Iter] == File.uri.fsPath)
		return true;

		return false;
	};

	Fold(File) {

		// figure out what level we want.

		let Config = vscode.workspace.getConfiguration("autofold");
		let Filename = AutoFoldTracker.GetFilename(File);
		let Level = AutoFoldTracker.GetLevel(File);
		let Pack = 0;

		// check if it makes sense.

		if((Level <= 0 || Level > 9) && Level != 0) {
			vscode.window.showInformationMessage('Auto Fold: Valid range is 1 to 9.');
			return;
		}

		// commit.

		if(Config.unfold) {
			// this unfold is out here as the intented behaviour is to
			// always unfold a document before folding it, and, if for
			// example it was asked to be folded to level 3, but only
			// contains 2 levels, then you will see the full source.

			AutoFoldTracker.PrintDebug('>> unfold(): ' + File.uri.fsPath);
			vscode.commands.executeCommand('editor.unfoldAll');
		}

		if(Level > 0) {
			// then we apply the folding to the level that was asked.

			AutoFoldTracker.PrintDebug('>> fold(' + Level + '): ' + File.uri.fsPath);
			vscode.commands.executeCommand('editor.foldLevel' + Level);
			vscode.window.setStatusBarMessage("Auto Fold: " + Level,2000);

			if(Config.pack) {
				// once the requested level is folded we can fold all
				// the subtrees super fast, because they are no longer
				// being rendered - if microsoft did it right - else
				// this is a placebo speed boost. the technically
				// correct way to computer science it, but without any
				// backup implementation to support it lololol. honestly
				// if it doesnt help the speed i'd almost rather see
				// my code pack up as though its an intended animation.

				Pack = Level;
				while(10 > Pack++) {
					AutoFoldTracker.PrintDebug(">> pack(" + Pack + ")")
					vscode.commands.executeCommand('editor.foldLevel' + Pack);
				}
			}
		}

		// and remember we did this file.

		AutoFoldTracker.Files.push(Filename);

		return;
	};

	CommandFold() {

		let Current = AutoFoldTracker.GetCurrentDocument();

		if(Current)
		AutoFoldTracker.Fold(vscode.window.activeTextEditor.document);

		return;
	};

	OnFileOpen(File) {

		// so this has to be on a delay apparently, because we are able to
		// start processing the file before vscode.

		let Config = vscode.workspace.getConfiguration("autofold");

		AutoFoldTracker.PrintDebug(`FILE OPENED: ${File.uri.fsPath}`);

		if(AutoFoldTracker.Interval) {
			clearInterval(AutoFoldTracker.Interval);
			AutoFoldTracker.Interval = 0;
		}

		AutoFoldTracker.Interval = setTimeout(function(){
			if(AutoFoldTracker.Has(File))
			return;

			AutoFoldTracker.Fold(File);
			return;
		},Config.delay);
	};

	OnFileClose(File) {

		// this has been put on a delay to give the editor time to actually
		// notice that a file was closed...

		setTimeout(function(){
			let Iter = 0
			let Files = new Array;

			// fix for vscode 1.11.0 insiders adding .git to the end of files...
			// https://github.com/Microsoft/vscode/issues/22561
			let Filename = File.uri.fsPath.replace(/\.git$/,'');

			// if the file is still open do nothing.
			for(Iter = 0; Iter < vscode.workspace.textDocuments.length; Iter++) {
				//AutoFoldTracker.PrintDebug("file to check: " + Filename);
				//AutoFoldTracker.PrintDebug("currently open: " + vscode.workspace.textDocuments[Iter].uri.fsPath);

				if(vscode.workspace.textDocuments[Iter].uri.fsPath == Filename)
				return;
			}

			// AutoFoldTracker.PrintDebug("file closed: " + Filename);

			// pull it out.
			for(Iter = 0; Iter < AutoFoldTracker.Files.length; Iter++)
			if(File.uri.fsPath != AutoFoldTracker.Files[Iter])
			Files.push(AutoFoldTracker.Files[Iter]);

			AutoFoldTracker.Files = Files;
		},1000);

		return;
	};

	GetLevel(File) {

		// attempt to find vscode-fold=# in the file, keeping it at the end
		// of the line to avoid triggering it when just talking about it in
		// a comment which more or less will only ever even happen in this
		// code lol.

		let Result = File.getText().match(/vscode-fold=(\d+)/m);
		let Level = 0;

		////////

		// did the file specify the magic comment?

		if(Result && Result.length == 2 && parseInt(Result[1]) > 0)
		Level = Result[1];

		////////

		// fallback to configured values.

		if(Level == 0)
		Level = AutoFoldTracker.GetDefaultLevel(AutoFoldTracker.GetCurrentDocument());

		else
		AutoFoldTracker.PrintDebug("## using file vscode-fold: " + Level);

		////////

		return Level;
	};

	GetFilename(File) {

		if(typeof File.uri === 'object')
		return File.uri.fsPath;

		return File;
	};

	GetDefaultLevel(File) {

		let Config = vscode.workspace.getConfiguration("autofold");
		let Iter = 0;
		let Output = 0;
		let ExtConf;
		let ExtCurr;

		for(Iter = 0; Iter < Config.types.length; Iter++) {
			if(!AutoFoldTracker.IsTypeConfigValid(Config.types[Iter]))
			continue;

			ExtConf = Config.types[Iter].ext.toLowerCase();
			ExtCurr = File.uri.fsPath.toLowerCase();

			if(ExtCurr.indexOf(ExtConf) == (ExtCurr.length - ExtConf.length)) {
				AutoFoldTracker.PrintDebug(
					"## using autofold.types[" + Config.types[Iter].ext + "]: " +
					Config.types[Iter].level
				);
				Output = Config.types[Iter].level;
				break;
			}
		}

		// if we still have not found one then default to the default.

		if(Output == 0) {
			AutoFoldTracker.PrintDebug("## using autofold.default: " + Config.default);
			Output = Config.default;
		}

		return Output;
	};

	GetCurrentDocument() {

		if(vscode.window.activeTextEditor)
		if(vscode.window.activeTextEditor.document)
		return vscode.window.activeTextEditor.document;

		return null;
	};

	IsTypeConfigValid(TypeObject) {

		if(typeof TypeObject != "object")
		return false;

		if(typeof TypeObject.ext != "string")
		return false;

		if(typeof TypeObject.level != "number")
		return false;

		return true;
	};

	PrintDebug(Msg) {

		if(AutoFoldTracker.Debug)
		console.log("[AF] " + Msg);

		return;
	};

	IntervalClear() {


		return;
	};

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

let AutoFoldTracker = new _AutoFoldingSystem;

exports.activate
=function(context) {
/*//
hello moto
//*/

	context.subscriptions.push(vscode.commands.registerCommand(
		'extension.autofold',
		AutoFoldTracker.CommandFold
	));

	vscode.workspace.onDidOpenTextDocument(
		AutoFoldTracker.OnFileOpen,
		null,
		context
	);

	vscode.workspace.onDidCloseTextDocument(
		AutoFoldTracker.OnFileClose,
		null,
		context
	);

	AutoFoldTracker.PrintDebug('Auto Fold has loaded.');
	AutoFoldTracker.CommandFold();

	return AutoFoldTracker;
};

exports.deactivate
=function() {
/*//
otom olleh
//*/

	return;
};

