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
    const config = vscode.workspace.getConfiguration("cssPeakPro");
    const enableHover = config.get("enableHover", true);

    if (!enableHover) {
      return null;
    }

    // Implement hover delay
    const hoverDelay = config.get("hoverDelay", 500);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if token is cancelled during delay
        if (token.isCancellationRequested) {
          resolve(null);
          return;
        }

        // Try to get the word at position, but also check for HTML attributes
        const range = document.getWordRangeAtPosition(position);
        const word = range ? document.getText(range) : null;

        if (!word) {
          // Check if we're on an HTML tag
          const tagInfo = this.getHTMLTagAtPosition(document, position);
          if (!tagInfo) {
            resolve(null);
            return;
          }

          if (!this.isPotentialSelector(tagInfo.selector)) {
            resolve(null);
            return;
          }

          const cssRules = this.cssParser.getCSSRulesForSelector(
            tagInfo.selector,
            document.uri.fsPath
          );

          if (cssRules.length === 0) {
            resolve(null);
            return;
          }

          const maxRules = config.get("maxRulesToShow", 10);
          const relevantRules = cssRules.slice(0, maxRules);
          const hoverContent = this.createHoverContent(
            relevantRules,
            tagInfo.selector
          );

          resolve(new vscode.Hover(hoverContent, tagInfo.range));
          return;
        }

        // Only provide hover for potential CSS selectors
        if (!this.isPotentialSelector(word)) {
          resolve(null);
          return;
        }

        // Enhanced multi-word detection for compound selectors
        const enhancedSelectors = this.getEnhancedSelectors(
          word,
          document,
          position
        );

        const cssRules = this.cssParser.getCSSRulesForSelector(
          word,
          document.uri.fsPath
        );

        // Also search for additional selectors if multi-word detection is enabled
        const enableMultiWordDetection = config.get(
          "enableMultiWordDetection",
          true
        );
        if (enableMultiWordDetection && enhancedSelectors.length > 1) {
          for (const selector of enhancedSelectors.slice(1)) {
            // Skip the original word
            const additionalRules = this.cssParser.getCSSRulesForSelector(
              selector,
              document.uri.fsPath
            );
            cssRules.push(...additionalRules);
          }
        }

        if (cssRules.length === 0) {
          resolve(null);
          return;
        }

        const maxRules = config.get("maxRulesToShow", 10);
        const relevantRules = cssRules.slice(0, maxRules);

        const hoverContent = this.createHoverContent(relevantRules, word);

        resolve(new vscode.Hover(hoverContent, range));
      }, hoverDelay);
    });
  }

  /**
   * Get HTML tag information at a specific position
   */
  private getHTMLTagAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): { selector: string; range: vscode.Range } | null {
    const line = document.lineAt(position.line).text;
    const lineText = line.trim();

    // Check if this is an HTML tag
    const tagMatch = lineText.match(/<([a-zA-Z][a-zA-Z0-9]*)/);
    if (!tagMatch) {
      return null;
    }

    const tagName = tagMatch[1];

    // Check if we're hovering over the tag name itself
    const tagStartIndex = lineText.indexOf(`<${tagName}`);
    const tagEndIndex = tagStartIndex + tagName.length;

    // Create a range for the tag
    const tagStart = new vscode.Position(position.line, tagStartIndex + 1); // +1 to skip '<'
    const tagEnd = new vscode.Position(position.line, tagEndIndex);

    return {
      selector: tagName,
      range: new vscode.Range(tagStart, tagEnd),
    };
  }

  /**
   * Enhanced selector detection with multi-word support
   */
  private getEnhancedSelectors(
    word: string,
    document: vscode.TextDocument,
    position: vscode.Position
  ): string[] {
    const selectors = [word]; // Always include the original word
    const enableMultiWordDetection = vscode.workspace
      .getConfiguration("cssPeakPro")
      .get("enableMultiWordDetection", true);

    if (!enableMultiWordDetection) {
      return selectors;
    }

    // Look for common prefix/suffix patterns that might indicate related classes
    // For example: "btn-primary" might have related "btn" or "primary" rules

    // Split by common separators but keep the full word
    const cleanWord = word.replace(/^[.#]/, ""); // Remove . or # prefix

    // Look for hyphenated compounds (keep as single entity)
    if (cleanWord.includes("-")) {
      const parts = cleanWord.split("-");

      // Add each part as potential selector if they look like CSS classes
      for (const part of parts) {
        if (part.length > 2 && /^[a-zA-Z][a-zA-Z0-9]*$/.test(part)) {
          // Avoid common words that might give false positives
          const commonWords = [
            "the",
            "and",
            "for",
            "with",
            "from",
            "this",
            "that",
          ];
          if (!commonWords.includes(part.toLowerCase())) {
            selectors.push(`.${part}`);
          }
        }
      }
    }

    return selectors;
  }

  /**
   * Check if the word is a potential CSS selector
   */
  private isPotentialSelector(word: string): boolean {
    // Class selectors
    if (word.startsWith(".")) {
      return true;
    }

    // ID selectors
    if (word.startsWith("#")) {
      return true;
    }

    // HTML elements
    const commonElements = [
      "div",
      "span",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "button",
      "input",
      "form",
      "nav",
      "header",
      "footer",
      "main",
      "section",
      "article",
      "aside",
      "ul",
      "li",
      "ol",
      "a",
      "img",
      "table",
      "tr",
      "td",
      "th",
      "div",
      "span",
      "strong",
      "em",
    ];

    if (commonElements.includes(word.toLowerCase())) {
      return true;
    }

    // Custom elements or components (PascalCase or kebab-case)
    if (/^[A-Z][a-zA-Z]*$/.test(word) || /^[a-z]+(-[a-z]+)*$/.test(word)) {
      return true;
    }

    return false;
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
