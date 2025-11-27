function selectorMatches(cssSelector, elementSelector) {
    const cleanCssSelector = cssSelector.toLowerCase().trim();
    const cleanElementSelector = elementSelector.toLowerCase().trim();

    // Exact match
    if (cleanCssSelector === cleanElementSelector) {
        return true;
    }

    // If the element selector has no prefix (e.g. "container"), treat it as a potential class or ID
    let potentialClass = cleanElementSelector;
    let potentialId = cleanElementSelector;

    if (cleanElementSelector.startsWith(".")) {
        potentialClass = cleanElementSelector.substring(1);
    } else if (cleanElementSelector.startsWith("#")) {
        potentialId = cleanElementSelector.substring(1);
    }

    // Check for class match
    if (
        cleanCssSelector.includes(`.${potentialClass}`) ||
        cleanCssSelector.includes(`[class*="${potentialClass}"]`) ||
        cleanCssSelector.includes(`[class~="${potentialClass}"]`)
    ) {
        return true;
    }

    // Check for ID match
    if (cleanCssSelector.includes(`#${potentialId}`)) {
        return true;
    }

    // Element selector matching (only if it looks like an element tag)
    if (
        !cleanElementSelector.startsWith(".") &&
        !cleanElementSelector.startsWith("#")
    ) {
        const elementMatch = cleanElementSelector.match(
            /^([a-zA-Z][a-zA-Z0-9]*)/
        );
        if (elementMatch) {
            const elementName = elementMatch[1];
            if (
                cleanCssSelector.startsWith(elementName) ||
                cleanCssSelector.includes(` ${elementName}`) ||
                cleanCssSelector.includes(`>${elementName}`) ||
                cleanCssSelector.includes(`+${elementName}`) ||
                cleanCssSelector.includes(`~${elementName}`)
            ) {
                return true;
            }
        }
    }

    // Test 5: Related rules (pseudo-classes)
    // Hovering "btn" (word) vs ".btn:hover" (CSS)
    const match5 = selectorMatches(".btn:hover", "btn");
    console.log(`5. '.btn:hover' vs 'btn': ${match5} (Expected: true)`);

    // Hovering "btn" (word) vs ".btn-primary" (CSS) - Should this match?
    // Usually we only want exact base matches + pseudos, not just any prefix match
    // But current logic might be loose.
    const match6 = selectorMatches(".btn-primary", "btn");
    console.log(`6. '.btn-primary' vs 'btn': ${match6} (Maybe: false?)`);

    return false;
}

console.log("Testing selectorMatches logic:");

// Test 1: Hovering "container" (word) vs ".container" (CSS)
const match1 = selectorMatches(".container", "container");
console.log(`1. '.container' vs 'container': ${match1} (Expected: true)`);

// Test 2: Hovering "header" (word) vs "#header" (CSS)
const match2 = selectorMatches("#header", "header");
console.log(`2. '#header' vs 'header': ${match2} (Expected: true)`);

// Test 3: Hovering "div" (word) vs "div" (CSS)
const match3 = selectorMatches("div", "div");
console.log(`3. 'div' vs 'div': ${match3} (Expected: true)`);

// Test 4: Hovering ".container" (explicit) vs ".container" (CSS)
const match4 = selectorMatches(".container", ".container");
console.log(`4. '.container' vs '.container': ${match4} (Expected: true)`);

// Test 5: Related rules
const match5 = selectorMatches(".btn:hover", "btn");
console.log(`5. '.btn:hover' vs 'btn': ${match5} (Expected: true)`);
