/*//
//// Auto Fold
//// Bob Majdak Jr @bobmagicii <bob@nether.io>
//// Released under BSD 3-Clause
////
//// This extension will check files for the magic string:
//// vscode-fold=# and if found, will automatically fold that file to the
//// specified level when it is opened.
////
//// vscode-fold=2
//*/

let vscode = require('vscode');

/*//
microsoft in their infinite fucking wisdom made the "open" event fire every time
you switch tabs. what the fuck, people. so here is this retarded overengineered
thing designed to do what the events should be describing.

it gets better, the close event also fires on tab switch. and when you close
a tab there is no way to ask the TextDocument if it is really still open so
don't forget to check out the hillarious clusterfuck in the OnFileClose method.

Known Issues:
vscode loads extensions lazy, which happens after files open. files that are
already open will be folded the first time you switch to that tab. if a file
was already open in the active tab before the plugin loaded then you may need
to switch tabs forth and back, or use the command autofold.
//*/

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var AutoFoldTracker = {
/*//
this is the main api instance that contains all the tracking and actions
to make this thing go.
//*/

	Version: 105,
	/*//
	@type Int
	current api version.
	//*/

	Debug: false,
	/*//
	@type Bool
	supress debugging messages. i think console.log is slow so maybe we can
	get moar by skipping them.
	//*/

	Files: [],
	/*//
	@type Array
	holds a list of filenames we currently have open so that it can remember
	if it has already attempted a file fold this session or not.
	//*/

	Has:
	function(File) {
	/*//
	@argv TextDocument
	@return Bool
	check if we have seen this file before or not. we have to do this because
	code is stupid and fires the damn open event every time you switch
	regardless of if that was the first time it was opened or not.
	//*/

		let Iter = 0;

		for(Iter = 0; Iter < AutoFoldTracker.Files.length; Iter++)
		if(AutoFoldTracker.Files[Iter] == File.uri.fsPath)
		return true;

		return false;
	},

	Fold:
	function(File) {
	/*//
	@argv TextDocument
	@return Void
	attempt to perform a folding operation.
	//*/

		// figure out what level we want.

		let Config = vscode.workspace.getConfiguration("autofold");
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

		AutoFoldTracker.Files.push(File.uri.fsPath);

		return;
	},

	CommandFold:
	function() {
	/*//
	handler for when fold is requested by the pallete command.
	//*/

		let Current = AutoFoldTracker.GetCurrentDocument();

		if(Current)
		AutoFoldTracker.Fold(vscode.window.activeTextEditor.document);

		return;
	},

	OnFileOpen:
	function(File) {
	/*//
	@argv TextDocument
	@return Void
	when a file is opened, fold it.
	//*/

		// so this has to be on a delay apparently, because we are able to
		// start processing the file before vscode.

		let Config = vscode.workspace.getConfiguration("autofold");

		setTimeout(function(){
			if(AutoFoldTracker.Has(File))
			return;

			AutoFoldTracker.Fold(File);
			return;
		},Config.delay);
	},

	OnFileClose:
	function(File) {
	/*//
	@argv TextDocument
	@return Void
	when a file is closed, forget about it.
	//*/

		// this has been put on a delay to give the editor time to actually
		// notice that a file was closed...

		setTimeout(function(){
			let Iter = 0
			let Files = new Array;

			// if the file is still open do nothing.

			for(Iter = 0; Iter < vscode.workspace.textDocuments.length; Iter++)
			if(vscode.workspace.textDocuments[Iter].uri.fsPath == File.uri.fsPath)
			return;

			// pull it out.

			for(Iter = 0; Iter < AutoFoldTracker.Files.length; Iter++)
			if(File.uri.fsPath != AutoFoldTracker.Files[Iter])
			Files.push(AutoFoldTracker.Files[Iter]);

			AutoFoldTracker.Files = Files;
		},1000);

		return;
	},

	GetLevel:
	function(File) {
	/*//
	@argv TextDocument
	@return Int
	try and find the magic comment within the file. returns the int value of
	that comment for the fold levels.
	//*/

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
	},

	GetDefaultLevel:
	function(File) {
	/*//
	@argv TextDocument
	@return Int
	try and find a folding level based on the extension of this file. if none
	is found then return the default default.
	//*/

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
	},

	GetCurrentDocument:
	function() {
	/*//
	@argv Void
	@return ?TextDocument
	get the currently active document.
	//*/

		if(vscode.window.activeTextEditor)
		if(vscode.window.activeTextEditor.document)
		return vscode.window.activeTextEditor.document;

		return null;
	},

	IsTypeConfigValid:
	function(TypeObject) {
	/*//
	@argv Object
	@return Bool
	make sure that the configuration object given for default types appears to
	be a usable format.
	//*/

		if(typeof TypeObject != "object")
		return false;

		if(typeof TypeObject.ext != "string")
		return false;

		if(typeof TypeObject.level != "number")
		return false;

		return true;
	},

	PrintDebug:
	function(Msg) {
	/*//
	@argv String
	@return Void
	prints prefixed debug messages.
	//*/

		if(AutoFoldTracker.Debug)
		console.log("[AF] " + Msg);

		return;
	}

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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

