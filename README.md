# CSS Peak Pro

An improved VSCode extension based on CSS Peak that provides smart CSS scoping and hover functionality.

## Key Differences from CSS Peak

### 🎯 Smart Scoping (Now Configurable!)

**CSS Peak**: Shows ALL CSS rules across the entire workspace, making it difficult to find the relevant rules when you have multiple files with the same class names (e.g., 20+ `container` classes across different pages).

**CSS Peak Pro**: Only shows CSS rules based on configurable scoping modes:

### ⚙️ Scoping Modes

1. **`smart`** (Default): Smart combination with fallback

   - Same name files (e.g., `index.html` → `index.css`)
   - Same folder CSS files
   - Common directories (`css/`, `styles/`, `src/css/`, etc.)
   - Fallback to global if no scoped files found

2. **`global`**: Show all CSS files in workspace

   - Searches entire directory tree
   - Useful for debugging or seeing all styles

3. **`folder`**: Same directory only

   - Only CSS files in the current file's directory
   - No subdirectory or global search

4. **`filename`**: Same name, any extension
   - Only CSS files with matching base name
   - `hello.rs` → `hello.css`, `hello.scss`, `hello.sass`, etc.

### 📱 Hover Support

- **Inline hover** - Hover over class names, IDs, or HTML elements to see CSS properties
- **Command-based viewing** - Select text and use `Ctrl+Shift+C` (Cmd+Shift+C on Mac) for detailed CSS display
- **Webview display** - Rich, formatted CSS display in a separate panel

### ⚙️ Configurable Settings

```json
{
  "cssPeakPro.scopingMode": "smart", // smart, global, folder, filename
  "cssPeakPro.cssFileExtensions": [
    // Custom file extensions
    "css",
    "scss",
    "sass",
    "less"
  ],
  "cssPeakPro.enableHover": true, // Toggle hover functionality
  "cssPeakPro.maxRulesToShow": 10, // Max rules to display
  "cssPeakPro.enableFallbackToGlobal": true // Fallback when no scoped files
}
```

## Installation

### From Source

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press `F5` in VSCode to open a new Extension Development Host window
5. In the new window, run the extension from the Extension view

### Development

```bash
npm install
npm run compile
# Press F5 in VSCode to start debugging
```

## Usage

### Hover Functionality

1. Open an HTML, JSX, TSX, or Vue file
2. Hover over any of the following:
   - Class names (`.my-class`)
   - ID selectors (`#my-id`)
   - HTML elements (`div`, `span`, `button`, etc.)
   - React components (`MyComponent`)

### Command Mode

1. Select any text (class name, element, etc.)
2. Press `Ctrl+Shift+C` (Cmd+Shift+C on Mac)
3. Or run "CSS Peak Pro: Show CSS for this element" from the command palette
4. A detailed panel will open showing all matching CSS rules

### Configuration Examples

#### Minimal Configuration (Global)

```json
{
  "cssPeakPro.scopingMode": "global"
}
```

#### Targeted Configuration (Filename)

```json
{
  "cssPeakPro.scopingMode": "filename",
  "cssPeakPro.cssFileExtensions": ["css", "scss"]
}
```

#### Project-Specific Configuration (Smart)

```json
{
  "cssPeakPro.scopingMode": "smart",
  "cssPeakPro.enableFallbackToGlobal": false
}
```

#### Custom File Types

```json
{
  "cssPeakPro.cssFileExtensions": ["css", "scss", "sass", "less", "styl"]
}
```

## Smart Scoping Examples

### Scenario 1: Same Name Files (Smart Mode)

```
project/
├── index.html
├── index.css     ← Priority: HIGH (same name)
├── about.html
├── about.css     ← Priority: HIGH (same name)
└── styles/
    └── global.css ← Priority: MEDIUM (common directory)
```

When viewing `index.html`:

- `index.css` rules are shown FIRST (same name, same folder)
- `global.css` rules are shown AFTER (common directory)
- `about.css` rules are NOT shown (different file, same priority but not matching)

### Scenario 2: Folder Mode

```
components/
├── button/
│   ├── button.html
│   ├── button.css  ← Priority: HIGH (same folder)
│   └── styles.css  ← Priority: MEDIUM (same folder)
└── styles/
    └── global.css  ← Priority: LOW (different folder)
```

When viewing `button.html` (Folder Mode):

- `button.css` and `styles.css` are shown (same folder only)
- `global.css` is NOT shown (different folder)

### Scenario 3: Filename Mode

```
src/
├── hello.rs
├── hello.css      ← Priority: HIGH (same name)
├── hello.scss     ← Priority: MEDIUM (same name, different ext)
└── styles.css     ← Priority: LOW (different name)
```

When viewing `hello.rs` (Filename Mode):

- Only `hello.css` and `hello.scss` are shown
- `styles.css` is NOT shown (different name)

### Scenario 4: Global Mode

```
workspace/
├── index.html
├── about.html
├── styles/
│   ├── global.css
│   └── layout.css
└── components/
    └── button.css
```

When viewing any HTML file (Global Mode):

- ALL CSS files in workspace are shown
- Useful for debugging or comprehensive analysis

## Features

### ✅ What's Implemented

- [x] Configurable scoping modes (smart, global, folder, filename)
- [x] Customizable file extensions
- [x] Hover support for classes, IDs, and elements
- [x] Command-based CSS viewing with `Ctrl+Shift+C`
- [x] Smart file scoping (same folder, same name, common directories)
- [x] Multiple language support (HTML, JSX, TSX, Vue)
- [x] Webview display for detailed CSS viewing
- [x] Configuration options
- [x] Status bar integration
- [x] CSS caching for performance
- [x] Fallback to global when no scoped files found

### 🌍 Supported Languages

- HTML
- React (JSX/TSX)
- Vue.js
- PHP (basic support)
- And many more through configurable language list

### 🔧 Supported File Types

- CSS (.css)
- SCSS (.scss)
- SASS (.sass)
- LESS (.less)
- Stylus (.styl) - when added to extensions list

## Project Structure

```
css-peak-pro/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── cssParser.ts         # CSS parsing with configurable scoping
│   └── cssPeakProProvider.ts # Hover and command provider
├── test-project/            # Test project for demonstration
│   ├── index.html           # Test HTML file
│   ├── index.css            # Same-name CSS (high priority)
│   ├── about.html           # Another test file
│   ├── about.css            # Another same-name CSS
│   └── styles/
│       ├── global.css       # Global styles (medium priority)
│       └── components.css   # Component styles (medium priority)
├── scripts/
│   └── build.js            # Build automation
├── test-scoping.js         # Scoping mode demonstration
├── package.json             # Extension manifest
└── README.md               # This documentation
```

## Testing the Extension

1. **Open the test project**: Open the `test-project/` folder in VSCode
2. **Test different scoping modes**:
   - Try each scoping mode in settings
   - Open `test-project/index.html` and observe different results
   - Notice the difference between smart, folder, filename, and global modes
3. **Test smart scoping**:
   - Open `test-project/index.html` and hover over elements
   - Notice it shows styles from `index.css` first
   - Then styles from `styles/global.css` and `styles/components.css`
4. **Test different files**:
   - Open `test-project/about.html` and observe it shows styles from `about.css`
5. **Test hover vs command**:
   - Use hover for quick info
   - Use `Ctrl+Shift+C` for detailed view

## Configuration Reference

| Setting                             | Type    | Default                           | Description                                               |
| ----------------------------------- | ------- | --------------------------------- | --------------------------------------------------------- |
| `cssPeakPro.scopingMode`            | string  | `"smart"`                         | CSS scoping mode: `smart`, `global`, `folder`, `filename` |
| `cssPeakPro.cssFileExtensions`      | array   | `["css", "scss", "sass", "less"]` | Array of CSS file extensions to search for                |
| `cssPeakPro.enableHover`            | boolean | `true`                            | Enable CSS hover functionality                            |
| `cssPeakPro.maxRulesToShow`         | number  | `10`                              | Maximum number of CSS rules to display                    |
| `cssPeakPro.showInStatusBar`        | boolean | `true`                            | Show CSS Peak Pro in status bar                           |
| `cssPeakPro.enableFallbackToGlobal` | boolean | `true`                            | When no scoped CSS found, fall back to global files       |

## Troubleshooting

### Extension not showing CSS

1. Check that the file is in a workspace (not just a folder)
2. Verify CSS files exist in expected locations
3. Check VSCode output panel for error messages
4. Ensure scoping mode matches your expectations

### Wrong CSS rules showing

1. Check your `scopingMode` setting
2. Verify CSS files are in expected locations for your mode
3. Try different scoping modes to understand the behavior
4. Restart VSCode to clear any caching issues

### Performance Issues

1. Use `filename` or `folder` mode for large projects
2. Use `smart` mode with `enableFallbackToGlobal: false` for better performance
3. Limit `cssFileExtensions` to only what you need

## Contributing

This extension is designed to be easily extensible. Key areas for improvement:

- Support for more CSS frameworks and naming conventions
- Better selector matching algorithms
- Integration with CSS preprocessors
- Theme customization options

## License

MIT License - feel free to use and modify for your needs.
