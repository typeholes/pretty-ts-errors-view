import * as vscode from 'vscode';

type PrettyTarget = 'hover' | 'panel' | 'both';

export const config = {
   inPanel: true,
   inHover: false,
};

function updateConfig() {
   const _config = vscode.workspace.getConfiguration('docsView');
   const target = _config.get<PrettyTarget>('prettyTsErrors.target') || 'hover';
   config.inPanel = target === 'panel' || target === 'both';
   config.inHover = target === 'hover' || target === 'both';
   config.inHover = true;
   config.inPanel = true;
}

vscode.workspace.onDidChangeConfiguration(updateConfig);
