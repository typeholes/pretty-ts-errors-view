import { marked } from 'marked';
import * as vscode from 'vscode';
import { CodeHighlighter } from './codeHighlighter';
import { formatDiagnostic } from './format/formatDiagnostic';

export class Renderer {
   private readonly _disposables: vscode.Disposable[] = [];

   private readonly _highlighter: CodeHighlighter;

   public readonly needsRender: vscode.Event<void>;

   constructor() {
      this._highlighter = new CodeHighlighter();
      this._disposables.push(this._highlighter);

      this.needsRender = this._highlighter.needsRender;
   }

   dispose() {
      let item: vscode.Disposable | undefined;
      while ((item = this._disposables.pop())) {
         item.dispose();
      }
   }

   public async render(
      document: vscode.TextDocument,
      diagnostics: readonly vscode.Diagnostic[]
   ): Promise<string> {
      const config = vscode.workspace.getConfiguration('docsView');
      const gfmEnabled = config.get('gfmEnabled', true);
      const sanitizeEnabled = config.get('sanitizeEnabled', false);
      const parts = diagnostics.map((d) => formatDiagnostic(d).value);

      if (!parts.length) {
         return '';
      }

      const markdown = parts.join('\n---\n');

      const highlighter = await this._highlighter.getHighlighter(document);

      const rendered = marked(markdown, {
         highlight: highlighter,
         sanitize: sanitizeEnabled,
         gfm: gfmEnabled,
      });

      return rendered.replaceAll('<p></p>', '');
   }

   // private getMarkdown(content: vscode.MarkedString): string {
   //    if (typeof content === 'string') {
   //       return content;
   //    } else if (content instanceof vscode.MarkdownString) {
   //       return content.value;
   //    } else {
   //       const markdown = new vscode.MarkdownString();
   //       markdown.appendCodeblock(content.value, content.language);
   //       return markdown.value;
   //    }
   // }
}
