// Input Parser Utility for different programming languages
// Converts example inputs to stdin format based on language

/**
 * Parse example input text into stdin format for different languages
 * 
 * Example input formats:
 * - "nums = [2,7,11,15], target = 9"
 * - "l1 = [2,4,3], l2 = [5,6,4]"
 * - "s = 'abc'"
 * - "n = 10"
 * 
 * @param {string} inputText - Raw input from example
 * @param {string} language - Programming language (python, java, cpp, javascript, etc.)
 * @returns {string} Formatted stdin string
 */
function parseInputForLanguage(inputText, language) {
  if (!inputText) return '';

  try {
    // Split by comma but keep array brackets intact
    const parts = [];
    let currentPart = '';
    let bracketCount = 0;
    
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      
      if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
      else if (char === ',' && bracketCount === 0) {
        parts.push(currentPart.trim());
        currentPart = '';
        continue;
      }
      
      currentPart += char;
    }
    if (currentPart) parts.push(currentPart.trim());

    let stdin = '';

    if (language === 'python' || language === 'python3') {
      // Python: Keep arrays as is, separate values with newline
      stdin = parts
        .map(p => p.replace(/(\w+)\s*=\s*/, ''))
        .join('\n');
    } 
    else if (language === 'javascript' || language === 'typescript') {
      // JavaScript/TypeScript: Keep arrays as is, separate values with newline
      stdin = parts
        .map(p => p.replace(/(\w+)\s*=\s*/, ''))
        .join('\n');
    } 
    else if (language === 'java' || language === 'cpp' || language === 'c' || language === 'csharp') {
      // Java/C++/C#: Convert arrays to space-separated values
      stdin = parts
        .map(p => {
          const cleaned = p.replace(/(\w+)\s*=\s*/, '');
          // Convert [1,2,3] to 1 2 3
          return cleaned.replace(/\[|\]/g, '').replace(/,/g, ' ');
        })
        .join('\n');
    }
    else if (language === 'ruby' || language === 'go' || language === 'rust' || 
             language === 'php' || language === 'swift' || language === 'kotlin') {
      // Other languages: Remove variable names and keep values
      stdin = parts
        .map(p => p.replace(/(\w+)\s*=\s*/, ''))
        .join('\n');
    }
    else {
      // Default: Just remove variable assignments
      stdin = parts
        .map(p => p.replace(/(\w+)\s*=\s*/, ''))
        .join('\n');
    }

    return stdin;
  } catch (error) {
    console.error('Error parsing input:', error);
    return inputText;
  }
}

/**
 * Parse expected output from example
 * Handles various formats: arrays, numbers, strings, booleans, etc.
 * 
 * @param {string} outputText - Raw output from example
 * @returns {string} Normalized output for comparison
 */
function parseExpectedOutput(outputText) {
  if (!outputText) return '';
  return outputText.trim();
}

/**
 * Compare actual output with expected output
 * Handles different formats and whitespace variations
 * 
 * @param {string} actual - Actual output from compiler
 * @param {string} expected - Expected output from example
 * @returns {boolean} Whether they match
 */
function compareOutputs(actual, expected) {
  if (!actual || !expected) {
    return actual.trim() === expected.trim();
  }

  // Trim and compare
  const actualTrimmed = actual.trim();
  const expectedTrimmed = expected.trim();

  // Direct comparison
  if (actualTrimmed === expectedTrimmed) return true;

  // Try parsing as JSON arrays/objects
  try {
    const actualParsed = JSON.parse(actualTrimmed);
    const expectedParsed = JSON.parse(expectedTrimmed);
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
  } catch (e) {
    // Not JSON, continue with string comparison
  }

  // Try comparing line by line
  const actualLines = actualTrimmed.split('\n').map(l => l.trim()).filter(l => l);
  const expectedLines = expectedTrimmed.split('\n').map(l => l.trim()).filter(l => l);

  if (actualLines.length === expectedLines.length) {
    return actualLines.every((line, i) => line === expectedLines[i]);
  }

  return false;
}

module.exports = {
  parseInputForLanguage,
  parseExpectedOutput,
  compareOutputs
};
