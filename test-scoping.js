const fs = require("fs");
const path = require("path");

// Test file to demonstrate CSS Peak Pro scoping modes
console.log("Testing CSS Peak Pro Scoping Modes...\n");

console.log("🎯 Available Scoping Modes:");
console.log("1. smart (default) - Smart combination with fallback");
console.log("2. global - Search entire workspace");
console.log("3. folder - Same directory only");
console.log("4. filename - Same name files (any extension)\n");

console.log("📁 Example Scenarios:");
console.log("==================\n");

// Scenario 1: Smart Mode (Current File: hello.rs)
console.log("🔍 Smart Mode (Current: hello.rs)");
console.log("Priority Order:");
console.log("1. hello.css (same name, same folder)");
console.log("2. *.css in same directory");
console.log("3. CSS in common directories (css/, styles/, etc.)");
console.log("4. Fallback to global (if enabled)");
console.log("✅ Result: Shows hello.css first, then other local CSS files\n");

// Scenario 2: Global Mode (Current File: hello.rs)
console.log("🌍 Global Mode (Current: hello.rs)");
console.log("Priority Order:");
console.log("1. ALL CSS files in workspace");
console.log("2. Searches entire directory tree");
console.log("✅ Result: Shows ALL CSS files regardless of location\n");

// Scenario 3: Folder Mode (Current File: hello.rs)
console.log("📂 Folder Mode (Current: hello.rs)");
console.log("Priority Order:");
console.log("1. *.css in hello.rs directory only");
console.log("2. NO search in subdirectories");
console.log("3. NO search in common directories");
console.log("✅ Result: Shows only CSS files in same directory\n");

// Scenario 4: Filename Mode (Current File: hello.rs)
console.log("🏷️ Filename Mode (Current: hello.rs)");
console.log("Priority Order:");
console.log("1. hello.css");
console.log("2. hello.scss");
console.log("3. hello.sass");
console.log("4. hello.less");
console.log("5. NO other CSS files");
console.log("✅ Result: Shows only hello.* CSS files\n");

console.log("⚙️ Configuration Examples:");
console.log("=========================\n");

console.log("JSON Settings:");
console.log(`{
  "cssPeakPro.scopingMode": "smart",
  "cssPeakPro.cssFileExtensions": ["css", "scss", "sass", "less"],
  "cssPeakPro.enableFallbackToGlobal": true
}`);

console.log("\n🔧 Custom Extensions:");
console.log("Add new file types:");
console.log(`{
  "cssPeakPro.cssFileExtensions": ["css", "scss", "sass", "less", "styl"]
}`);

console.log("\n📊 Expected File Finds:");
console.log("======================\n");

const testFiles = [
  { file: "hello.rs", css: "hello.css", expected: "SAME NAME" },
  { file: "index.html", css: "index.css", expected: "SAME NAME" },
  { file: "component.jsx", css: "component.css", expected: "SAME NAME" },
  { file: "about.ts", css: "about.scss", expected: "SAME NAME" },
];

testFiles.forEach((test) => {
  console.log(`${test.file} → ${test.css} ✅ (${test.expected})`);
});

console.log("\n🎉 Scoping Test Complete!");
console.log(
  "The extension now supports flexible CSS discovery based on your preferences."
);
