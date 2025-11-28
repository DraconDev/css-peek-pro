import * as vscode from "vscode";
import { CSSDefinitionProvider } from "./cssDefinitionProvider";
import { CSSParser } from "./cssParser";
import { CSSPeakProProvider } from "./cssPeakProProvider";
import { CSSReferenceProvider } from "./cssReferenceProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSS Peek Pro extension is now ACTIVE");

  // Get configuration
  const config = vscode.workspace.getConfiguration("cssPeakPro");
  const enabled = config.get("enabled", true);
  console.log(`CSS Peek Pro: Extension enabled = ${enabled}`);

  // If extension is disabled, return early
  if (!enabled) {
    console.log("CSS Peek Pro is disabled in settings");
    return;
  }

  // Initialize the CSS parser
  const cssParser = new CSSParser();
  console.log("CSS Peek Pro: CSS parser initialized");

  // Register the hover provider for ALL languages (like CSS Peek does)
  const hoverProvider = new CSSPeakProProvider(cssParser);
  const hoverProviderRegistration = vscode.languages.registerHoverProvider(
    "*", // ALL languages
    hoverProvider
  );
  console.log("CSS Peek Pro: Hover provider registered for all languages");

  // Register the definition provider for Ctrl+Click go-to-definition (configurable)
  const enableGoToDefinition = config.get("enableGoToDefinition", true);
  console.log(
    `CSS Peek Pro: Go-to-definition enabled = ${enableGoToDefinition}`
  );

  let definitionProviderRegistration: vscode.Disposable | null = null;

  if (enableGoToDefinition) {
    const definitionProvider = new CSSDefinitionProvider(cssParser);
    definitionProviderRegistration =
      vscode.languages.registerDefinitionProvider(
        "*", // ALL languages
        definitionProvider
      );
    console.log(
      "CSS Peek Pro: Definition provider registered for all languages"
    );
  } else {
    console.log("CSS Peek Pro: Definition provider disabled");
  }

  // Register the reference provider for HTML Peek (Reverse CSS Peek)
  // This allows finding usages of CSS classes/IDs in HTML files
  const referenceProvider = new CSSReferenceProvider();
  const referenceProviderRegistration =
    vscode.languages.registerReferenceProvider(
      ["css", "scss", "sass", "less"],
      referenceProvider
    );
  context.subscriptions.push(referenceProviderRegistration);
  console.log("CSS Peek Pro: Reference provider registered for CSS files");

  // Add disposables to context
  context.subscriptions.push(hoverProviderRegistration);
  if (definitionProviderRegistration) {
    context.subscriptions.push(definitionProviderRegistration);
  }

  // Initialize configuration and watch for changes
  // Status bar removed as per user request  }

  // Watch for configuration changes to dynamically update language support
  const configurationChange = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("cssPeakPro")) {
      console.log("CSS Peek Pro configuration changed, reloading...");
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  });

  context.subscriptions.push(configurationChange);

  console.log(`CSS Peek Pro activated successfully for ALL languages`);
}

export function deactivate() {
  console.log("CSS Peek Pro extension is now deactivated");
}
