import * as vscode from "vscode";
import { CSSDefinitionProvider } from "./cssDefinitionProvider";
import { CSSParser } from "./cssParser";
import { CSSPeakProProvider } from "./cssPeakProProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSS Peak Pro extension is now active");

  // Get configuration
  const config = vscode.workspace.getConfiguration("cssPeakPro");
  const enabled = config.get("enabled", true);

  // If extension is disabled, return early
  if (!enabled) {
    console.log("CSS Peak Pro is disabled in settings");
    return;
  }

  // Initialize the CSS parser
  const cssParser = new CSSParser();

  // Get supported languages from configuration
  const supportedLanguages: string[] = config.get("peekFromLanguages", [
    "html",
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "rust",
  ]);

  // Register the hover provider for supported languages
  const hoverProvider = new CSSPeakProProvider(cssParser);
  const hoverProviderRegistration = vscode.languages.registerHoverProvider(
    supportedLanguages,
    hoverProvider
  );

  // Register the definition provider for Ctrl+Click go-to-definition (configurable)
  const enableGoToDefinition = config.get("enableGoToDefinition", true);

  let definitionProviderRegistration: vscode.Disposable | null = null;

  if (enableGoToDefinition) {
    const definitionProvider = new CSSDefinitionProvider(cssParser);
    definitionProviderRegistration =
      vscode.languages.registerDefinitionProvider(
        supportedLanguages,
        definitionProvider
      );
  }

  // Register the command
  const command = vscode.commands.registerCommand("cssPeakPro.showCSS", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found");
      return;
    }

    const document = editor.document;
    const selection = editor.selection;

    const text = document.getText(selection);
    if (!text) {
      vscode.window.showWarningMessage("No text selected");
      return;
    }

    hoverProvider.showCSSForSelection(text, selection.start);
  });

  // Add disposables to context
  context.subscriptions.push(hoverProviderRegistration);
  if (definitionProviderRegistration) {
    context.subscriptions.push(definitionProviderRegistration);
  }
  context.subscriptions.push(command);

  // Initialize configuration and watch for changes
  const showInStatusBar = config.get("showInStatusBar", true);

  if (showInStatusBar) {
    // Add status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = "cssPeakPro.showCSS";
    statusBarItem.text = "$(paintcan) CSS Peak Pro";
    statusBarItem.tooltip = "Click to show CSS for selected element";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
  }

  // Watch for configuration changes to dynamically update language support
  const configurationChange = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("cssPeakPro")) {
      console.log("CSS Peak Pro configuration changed, reloading...");
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  });

  context.subscriptions.push(configurationChange);

  console.log(
    `CSS Peak Pro activated for languages: ${supportedLanguages.join(", ")}`
  );
}

export function deactivate() {
  console.log("CSS Peak Pro extension is now deactivated");
}
