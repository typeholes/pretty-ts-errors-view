import {
   ExtensionContext,
   languages,
   MarkdownString,
   Range,
   window,
} from 'vscode';
import { formatDiagnostic } from './format/formatDiagnostic';
import { hoverProvider } from './hoverProvider';
import { uriStore } from './uriStore';
import { has } from './utils';
import * as vscode from 'vscode';
import { config } from './config';
import { DocsViewViewProvider } from './docsView';

export function activate(context: ExtensionContext) {
   const registeredLanguages = new Set<string>();

   const provider = new DocsViewViewProvider(context.extensionUri);
   context.subscriptions.push(provider);

   context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
         DocsViewViewProvider.viewType,
         provider
      )
   );

   context.subscriptions.push(
      window.onDidChangeActiveColorTheme((e) => {}), // TODO: change background color
      languages.onDidChangeDiagnostics(async (e) => {
         e.uris.forEach((uri) => {
            const diagnostics = languages.getDiagnostics(uri);

            const items: {
               range: Range;
               contents: MarkdownString[];
            }[] = [];

            let hasTsDiagnostic = false;

            diagnostics
               .filter((diagnostic) =>
                  diagnostic.source
                     ? has(['ts', 'deno-ts', 'js'], diagnostic.source)
                     : false
               )
               .forEach(async (diagnostic) => {
                  if (config.inHover) {
                     items.push({
                        range: diagnostic.range,
                        contents: [formatDiagnostic(diagnostic)],
                     });
                  }
                  hasTsDiagnostic = true;
               });
            uriStore[uri.path] = items;

            if (hasTsDiagnostic && uri.scheme === 'file') {
               const editor = window.visibleTextEditors.find(
                  (editor) => editor.document.uri.toString() === uri.toString()
               );
               if (
                  editor &&
                  !registeredLanguages.has(editor.document.languageId)
               ) {
                  registeredLanguages.add(editor.document.languageId);
                  context.subscriptions.push(
                     languages.registerHoverProvider(
                        {
                           scheme: 'file',
                           language: editor.document.languageId,
                        },
                        hoverProvider
                     )
                  );
               }
            }
         });
      })
   );
}

// this method is called when your extension is deactivated
export function deactivate() {}
