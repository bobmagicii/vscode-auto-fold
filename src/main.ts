import * as vscode from 'vscode';

import Util from './core/util';
//import AutoFoldSystem from './core/auto-fold-system';

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export function activate(context: vscode.ExtensionContext) {

	Util.println('Loading Auto Fold...');

	//let afSystem = new AutoFoldSystem;

	(context.subscriptions)
	.push(
		(vscode.commands)
		.registerCommand(
			'autofoldyeah.autoFold',
			(() => vscode.window.showInformationMessage('TODO: execute the command.'))
		)
	);

	Util.println('Auto Fold Ready.');
	return;
};

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export function deactivate() {

};
