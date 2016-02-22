'use strict';

import { NotificationType } from 'vscode-languageclient';

// A literal to identify a text document in the client.
export interface TextDocumentIdentifier {
  fileName: string;
}

export namespace DidSaveTextDocumentNotification {
  export const type: NotificationType<TextDocumentIdentifier> = { get method() { return 'textDocument/didSave'; } };;
}
