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

	let afSystem = new AutoFoldSystem(vscode, context);

	if(vscode.window.activeTextEditor !== undefined)
	afSystem.onCommandFold();

	return;
};

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export function deactivate() {

	return;
};
