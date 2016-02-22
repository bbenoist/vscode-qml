"use strict";

import * as path from "path";
import * as protocol from "./protocol";

import { workspace, Disposable, ExtensionContext } from "vscode";
import {
  LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, NotificationType
} from "vscode-languageclient";

// This method is called when the extension is activated.
export function activate(context: ExtensionContext) {
  console.log("Activating the QML language client...");
  let serverModule = context.asAbsolutePath(path.join("server", "server.js"));
  let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
  let serverOptions = {
    run: { module: serverModule },
    debug: { module: serverModule, options: debugOptions }
  };
  let clientOptions: LanguageClientOptions = {
    // Register the server for QML.
    documentSelector: ["qml"]
  };
  let languageClient = new LanguageClient("QML Language", serverOptions, clientOptions);
  context.subscriptions.push(languageClient.start());
  let saveHandler = workspace.onDidSaveTextDocument((document) => {
    if (document.languageId != "qml") return;
    let params: protocol.TextDocumentIdentifier = { fileName: document.fileName };
    languageClient.sendNotification<protocol.TextDocumentIdentifier>(
      protocol.DidSaveTextDocumentNotification.type, params
    );
  });
  context.subscriptions.push(saveHandler);
  console.log("QML language client activated.");
}
