/*//
//// Auto Fold
//// Bob Majdak Jr @bobmagicii <bob@nether.io>
//// Released under BSD 3-Clause
////
//// This extension will check files for the magic string:
//// vscode-fold=# and if found, will automatically fold that file to the
//// specified level when it is opened.
////
//// vscode-fold=1
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

	Files: [],

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

		let Config = vscode.workspace.getConfiguration('autofold');
		let Level = AutoFoldTracker.Get(File);

		if(Level == 0 && Config.default > 0)
		Level = Config.default;

		// check if it makes sense.

		if(Level <= 0 || Level > 9) {
			if(Level != 0)
			vscode.window.showInformationMessage('Auto Fold: Valid range is 1 to 9.');

			return;
		}

		// commit.

		AutoFoldTracker.PrintDebug('Folding File: ' + File.uri.fsPath);
		vscode.window.setStatusBarMessage("Auto Folding Level " + Level,2000);
		vscode.commands.executeCommand('editor.foldLevel' + Level);

		// and remember we did this file.

		AutoFoldTracker.Files.push(File.uri.fsPath);

		return;
	},

	CommandFold:
	function() {
	/*//
	handler for when fold is requested by the pallete command.
	//*/

		if(!vscode.window.activeTextEditor) {
			// vscode.window.showErrorMessage('Auto Fold: No active text editors.');
			AutoFoldTracker.PrintDebug("No active text editors.");
			return;
		}

		if(!vscode.window.activeTextEditor.document) {
			// vscode.window.showErrorMessage('Auto Fold: No file open and active.');
			AutoFoldTracker.PrintDebug("No file open and active.");
			return;
		}

		AutoFoldTracker.Fold(vscode.window.activeTextEditor.document);
		return;
	},

	Get:
	function(File) {
	/*//
	@argv TextDocument
	@return Int
	try and find the magic comment within the file. returns the int value of
	that comment for the fold levels.
	//*/

		// attempt to find vscode-fold=# in the file, keeping it at the end of
		// the line to avoid triggering it when just talking about it in a
		// comment which more or less will only ever even happen in this code
		// lol.

		let Result = File.getText().match(/vscode-fold=(\d)$/m);

		if(Result && Result.length == 2 && parseInt(Result[1]) > 0)
		return parseInt(Result[1]);

		return 0;
	},

	OnFileOpen:
	function(File) {
	/*//
	@argv TextDocument
	@return Void
	when a file is opened, fold it.
	//*/

		if(AutoFoldTracker.Has(File))
		return;

		AutoFoldTracker.Fold(File);
		return;
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
			if(vscode.workspace.textDocuments[Iter].uri.fsPath == File.uri.fsPath) {
				AutoFoldTracker.PrintDebug(File.uri.fsPath + ' is still open.');
				return;
			}

			// pull it out.

			for(Iter = 0; Iter < AutoFoldTracker.Files.length; Iter++)
			if(File.uri.fsPath != AutoFoldTracker.Files[Iter])
			Files.push(AutoFoldTracker.Files[Iter]);

			AutoFoldTracker.Files = Files;
		},1000);

		return;
	},

	PrintDebug:
	function(Msg) {
	/*//
	@argv String
	@return Void
	prints prefixed debug messages.
	//*/

		console.log("[AF] " + Msg);
		return;
	}

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

exports.activate
=function(context) {

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

	return {};
};

exports.deactivate
=function() {

	return;
};

