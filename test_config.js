```javascript
const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock VSCode workspace configuration
let mockConfig = {
    scopingMode: "smart",
    cssFileExtensions: ["css"],
    enableFallbackToGlobal: false,
    commonDirectories: ["custom-styles"],
    fileNamePatterns: ["${filename}.styles"],
};

const mockVscode = {
    workspace: {
        getConfiguration: () => ({
            get: (key, defaultValue) => {
                const configKey = key.replace("cssPeakPro.", "");
                return mockConfig[configKey] !== undefined
                    ? mockConfig[configKey]
                    : defaultValue;
            },
        }),
        getWorkspaceFolder: () => ({
            uri: { fsPath: __dirname },
        }),
    },
    Uri: { file: (f) => ({ fsPath: f }) },
};

// Intercept require calls to return mock vscode
Module.prototype.require = function(path) {
    if (path === 'vscode') {
        return mockVscode;
    }
    return originalRequire.apply(this, arguments);
};

const { CSSParser } = require("./out/cssParser");
const path = require("path");
const fs = require("fs");

global.vscode = mockVscode; // Changed from 'vscode' to 'mockVscode' to ensure correctness

function testConfiguration() {
    const parser = new CSSParser();
    const testDir = __dirname;

    // Create dummy files
    const files = [
        "test.html",
        "test.styles.css", // Should match via fileNamePatterns
        "custom-styles/global.css", // Should match via commonDirectories
        "other.css", // Should NOT match
    ];

    // Setup directories and files
    if (!fs.existsSync(path.join(testDir, "custom-styles"))) {
        fs.mkdirSync(path.join(testDir, "custom-styles"));
    }

    files.forEach((f) => {
        const p = path.join(testDir, f);
        if (!fs.existsSync(p)) fs.writeFileSync(p, "body { color: red; }");
    });

    try {
        console.log("Testing Configuration Logic...");

        const foundFiles = parser.findCSSFiles(path.join(testDir, "test.html"));
        console.log(
            "Found CSS files:",
            foundFiles.map((f) => path.basename(f))
        );

        const foundStyles = foundFiles.some((f) =>
            f.endsWith("test.styles.css")
        );
        const foundGlobal = foundFiles.some((f) => f.endsWith("global.css"));
        const foundOther = foundFiles.some((f) => f.endsWith("other.css"));

        console.log(
            `1. Found 'test.styles.css' (Pattern Match): ${foundStyles} (Expected: true)`
        );
        console.log(
            `2. Found 'custom-styles/global.css' (Common Dir): ${foundGlobal} (Expected: true)`
        );
        console.log(
            `3. Found 'other.css' (Should NOT match): ${foundOther} (Expected: false)`
        );
    } finally {
        // Cleanup
        files.forEach((f) => {
            const p = path.join(testDir, f);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        if (fs.existsSync(path.join(testDir, "custom-styles"))) {
            fs.rmdirSync(path.join(testDir, "custom-styles"));
        }
    }
}

testConfiguration();
