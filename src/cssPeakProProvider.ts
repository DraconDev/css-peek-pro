import * as vscode from "vscode";
import { CSSParser, CSSRule } from "./cssParser";

export class CSSPeakProProvider implements vscode.HoverProvider {
  private cssParser: CSSParser;

  constructor(cssParser: CSSParser) {
    this.cssParser = cssParser;
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    console.log(
      `CSS Peak Pro: Hover triggered in ${document.languageId} at position ${position.line}:${position.character}`
    );

    const config = vscode.workspace.getConfiguration("cssPeakPro");
    const enableHover = config.get("enableHover", true);

    if (!enableHover) {
      console.log("CSS Peak Pro: Hover disabled in settings");
      return null;
    }

    // No delay for debugging
    const hoverDelay = config.get("hoverDelay", 100);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(
          `CSS Peak Pro: Processing hover after ${hoverDelay}ms delay`
        );

        // Check if token is cancelled during delay
        if (token.isCancellationRequested) {
          console.log("CSS Peak Pro: Token cancelled during delay");
          resolve(null);
          return;
        }

        // Try to get the word at position
        const range = document.getWordRangeAtPosition(position);
        const word = range ? document.getText(range) : null;

        console.log(`CSS Peak Pro: Found word "${word}" at position`);

        if (!word) {
          console.log("CSS Peak Pro: No word found at position");
          resolve(null);
          return;
        }

        // Only provide hover for potential CSS selectors
        if (!this.isPotentialSelector(word)) {
          console.log(
            `CSS Peak Pro: "${word}" not recognized as potential selector`
          );
          resolve(null);
          return;
        }

        console.log(`CSS Peak Pro: Processing CSS for "${word}"`);

        const cssRules = this.cssParser.getCSSRulesForSelector(
          word,
          document.uri.fsPath
        );

        console.log(
          `CSS Peak Pro: Found ${cssRules.length} CSS rules for "${word}"`
        );

        if (cssRules.length === 0) {
          console.log("CSS Peak Pro: No CSS rules found");
          resolve(null);
          return;
        }

        const maxRules = config.get("maxRulesToShow", 10);
        const relevantRules = cssRules.slice(0, maxRules);

        const hoverContent = this.createHoverContent(relevantRules, word);
        console.log("CSS Peak Pro: Created hover content");

        resolve(new vscode.Hover(hoverContent, range));
      }, hoverDelay);
    });
  }

  /**
   * Check if the word is a potential CSS selector - SUPER PERMISSIVE like CSS Peak
   */
  private isPotentialSelector(word: string): boolean {
    console.log(`CSS Peak Pro: Checking if "${word}" is a potential selector`);

    // Always return true for debugging - let the CSS parser decide if it matches
    // This is how CSS Peak works - it's very permissive
    console.log(
      `CSS Peak Pro: "${word}" accepted as potential selector (permissive mode)`
    );
    return true;

    // Original logic (commented out for now):
    /*
    // Class selectors (starts with .)
    if (word.startsWith(".")) {
      console.log(`CSS Peak Pro: "${word}" is a class selector`);
      return true;
    }

    // ID selectors (starts with #)
    if (word.startsWith("#")) {
      console.log(`CSS Peak Pro: "${word}" is an ID selector`);
      return true;
    }

    // HTML elements - be very permissive
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(word)) {
      console.log(`CSS Peak Pro: "${word}" is a valid element name`);
      return true;
    }

    // Custom elements or components (PascalCase)
    if (/^[A-Z][a-zA-Z]*$/.test(word)) {
      console.log(`CSS Peak Pro: "${word}" is a PascalCase component`);
      return true;
    }

    console.log(`CSS Peak Pro: "${word}" not recognized as potential selector`);
    return false;
    */
  }

  /**
   * Create hover content for inline display
   */
  private createHoverContent(
    rules: CSSRule[],
    selector: string
  ): vscode.MarkdownString {
    const content = new vscode.MarkdownString();

    content.appendText(`CSS Rules for "${selector}":\n\n`);

    rules.forEach((rule, index) => {
      const fileName = rule.filePath.split(/[\\/]/).pop();
      content.appendText(`📁 ${fileName}\n`);
      content.appendText(`🔧 ${rule.selector}\n`);

      // Add properties in a compact format
      Object.entries(rule.properties).forEach(([property, value]) => {
        content.appendText(`  ${property}: ${value};\n`);
      });

      if (index < rules.length - 1) {
        content.appendText("\n");
      }
    });

    if (
      rules.length >=
      vscode.workspace.getConfiguration("cssPeakPro").get("maxRulesToShow", 10)
    ) {
      content.appendText(
        `\n... and ${
          rules.length -
          vscode.workspace
            .getConfiguration("cssPeakPro")
            .get("maxRulesToShow", 10)
        } more rules`
      );
    }

    return content;
  }
}
