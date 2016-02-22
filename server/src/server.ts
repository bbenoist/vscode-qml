"use strict";

import * as protocol from "./protocol";
import * as childProcess from "child_process";

import {
  createConnection, IConnection, TextDocumentSyncKind,
  TextDocuments, ITextDocument, Diagnostic, DiagnosticSeverity,
  InitializeParams, InitializeResult, TextDocumentIdentifier,
  CompletionItem, CompletionItemKind
} from "vscode-languageserver";

// Create a connection for the server. The connection uses stdin / stdout for
// message passing.
let connection: IConnection = createConnection(process.stdin, process.stdout);

// Create a simple text document manager. The text document manager supports
// full document sync only.
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection for open, change and
// close text document events.
documents.listen(connection);

// After the server has started the client sends an initilize request. The server
// receives in the passed params the rootPath of the workspace plus the client
// capabilites.
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
  workspaceRoot = params.rootPath;
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.None
    }
  }
});

function validateTextDocument(textDocument: ITextDocument): void {
  let diagnostics: Diagnostic[] = [];
  let lines = textDocument.getText().split(/\r?\n/g);
  let problems = 0;
  for (var i = 0; i < lines.length; i++) {
    let line = lines[i];
    let index = line.indexOf("typescript");
    if (index >= 0) {
      problems++;
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: { line: i, character: index},
          end: { line: i, character: index + 10 }
        },
        message: `${line.substr(index, 10)} should be spelled TypeScript`
      });
    }
  }
  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function validateQmlFile(fileName : string) {
  let stdout = "";
  let stderr = "";
  let qmllint = "C:\\Qt\\5.4\\msvc2013\\bin\\qmllint.exe";
  connection.console.log("\"" + qmllint + "\" \"" + fileName + "\"")
  let process = childProcess.exec(
    `${qmllint} ${fileName}`, {},
    (error, stdout, stderr) => {
      connection.console.log('qmllint:' + stdout.toString());
      connection.console.log('qmllint:' + stderr.toString());
      if (error) {
        connection.console.log(`qmllint exited with code ${error}.`);
      }
    }
  );
}

/*
documents.onDidChangeContent((change) => {
});
*/
connection.onNotification(protocol.DidSaveTextDocumentNotification.type, (event) => {
  connection.console.log("Saved " + event.fileName);
  validateQmlFile(event.fileName);
});
/*
connection.onDidChangeWatchedFiles((change) => {
  connection.console.log("We recevied an file change event");
});
*/

connection.onDidOpenTextDocument((params) => {
  connection.console.log(`${params.uri} opened.`);
});

connection.onDidCloseTextDocument((params) => {
  connection.console.log(`${params.uri} closed.`);
});

// Listen on the connection
connection.listen();
