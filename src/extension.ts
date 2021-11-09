import * as vscode from 'vscode';
import Util from './util';

export function activate(context: vscode.ExtensionContext) {

	Util.println('Loading Auto Fold...');

	(context.subscriptions)
	.push(
		(vscode.commands)
		.registerCommand(
			'autofoldyeah.autoFold',
			(() => vscode.window.showInformationMessage('TODO: execute the command.'))
		)
	);

	Util.println('Auto Fold Ready.');
	//return;
}

// this method is called when your extension is deactivated
export function deactivate() {}
