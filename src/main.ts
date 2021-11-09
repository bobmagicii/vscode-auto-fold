import * as vscode from 'vscode';

import Util from './core/util';
import AutoFoldSystem from './core/auto-fold-system';

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export function activate(context: vscode.ExtensionContext) {
/*//
@date 2021-11-09
@activation onStartupFinished
//*/

	Util.println('Loading Auto Fold...');

	let afSystem = new AutoFoldSystem;

	////////

	(context.subscriptions)
	.push(
		(vscode.commands)
		.registerCommand(
			'autofoldyeah.autoFold',
			afSystem.onCommandFold.bind(afSystem)
		)
	);

	(vscode.window)
	.onDidChangeActiveTextEditor(
		afSystem.onSwitchedEditors.bind(afSystem)
	);

	////////

	if(vscode.window.activeTextEditor !== undefined)
	afSystem.onCommandFold();

	////////

	Util.println('Auto Fold Ready.');
	return;
};

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export function deactivate() {

};
