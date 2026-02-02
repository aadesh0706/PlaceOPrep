const request = require("request");

// Map language codes to file extensions
const LANGUAGE_EXTENSIONS = {
  python: "index.py",
  cpp: "index.cpp",
  java: "Solution.java",
  javascript: "index.js",
  c: "index.c",
  ruby: "index.rb",
  go: "index.go",
  rust: "index.rs",
  php: "index.php",
  swift: "index.swift",
  kotlin: "Solution.kt",
  typescript: "index.ts",
  csharp: "Solution.cs",
  r: "index.r",
  perl: "index.pl"
};

exports.executeCode = (req, res) => {
  const { code, language, stdin, input } = req.body;

  // Validate required fields
  if (!code || code.trim() === "") {
    return res.status(400).json({ error: "Code is required" });
  }

  if (!language) {
    return res.status(400).json({ error: "Language is required" });
  }

  // Validate language
  if (!LANGUAGE_EXTENSIONS[language]) {
    return res.status(400).json({ 
      error: `Unsupported language: ${language}`,
      supported: Object.keys(LANGUAGE_EXTENSIONS)
    });
  }

  const fileName = LANGUAGE_EXTENSIONS[language];
  const apiKey = process.env.ONECOMPILER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OneCompiler API key not configured" });
  }

  // Process input - handle both stdin and input fields
  let processedInput = "";
  if (stdin) {
    processedInput = typeof stdin === 'string' ? stdin : String(stdin);
  } else if (input) {
    processedInput = typeof input === 'string' ? input : String(input);
  }
  
  // Smart input parsing based on data structure detection
  if (processedInput.trim()) {
    const inputText = processedInput.trim();
    let parsedInput = '';
    
    // Detect and handle different data structures
    
    // 1. Array problems (Two Sum, Three Sum, etc.)
    if (inputText.includes('[') && inputText.includes(']')) {
      const arrayMatches = inputText.match(/\[([^\]]+)\]/g);
      if (arrayMatches) {
        arrayMatches.forEach(match => {
          const values = match.replace(/[\[\]]/g, '').replace(/,\s*/g, ' ');
          parsedInput += values + '\n';
        });
      }
      // Extract additional numeric values (like target)
      const numMatches = inputText.match(/=\s*(\d+)/g);
      if (numMatches) {
        numMatches.forEach(match => {
          const value = match.replace('=', '').trim();
          parsedInput += value + '\n';
        });
      }
    }
    
    // 2. String problems (Valid Parentheses, Palindrome, etc.)
    else if (inputText.includes('"') || inputText.includes("'")) {
      const stringMatch = inputText.match(/["']([^"']+)["']/);
      if (stringMatch) {
        parsedInput = stringMatch[1] + '\n';
      }
    }
    
    // 3. Single number problems (Climbing Stairs, Fibonacci, etc.)
    else if (/^\w+\s*=\s*\d+$/.test(inputText)) {
      const numMatch = inputText.match(/=\s*(\d+)/);
      if (numMatch) {
        parsedInput = numMatch[1] + '\n';
      }
    }
    
    // 4. Linked List problems (detect by keywords)
    else if (inputText.includes('head') || inputText.includes('list')) {
      // Convert [1,2,3,4,5] format to space-separated for linked list
      const listMatch = inputText.match(/\[([^\]]+)\]/);
      if (listMatch) {
        const values = listMatch[1].replace(/,\s*/g, ' ');
        parsedInput = values + '\n';
      }
    }
    
    // 5. Tree problems (detect by keywords)
    else if (inputText.includes('root') || inputText.includes('tree')) {
      // Handle tree input format
      const treeMatch = inputText.match(/\[([^\]]+)\]/);
      if (treeMatch) {
        const values = treeMatch[1].replace(/,\s*/g, ' ');
        parsedInput = values + '\n';
      }
    }
    
    // 6. Matrix problems (2D arrays)
    else if (inputText.includes('[[') || inputText.includes('matrix')) {
      // Handle 2D array format
      const matrixMatches = inputText.match(/\[\[([^\]]+)\]\]/g);
      if (matrixMatches) {
        matrixMatches.forEach(match => {
          const rows = match.replace(/\[\[|\]\]/g, '').split('],[');
          rows.forEach(row => {
            const values = row.replace(/,\s*/g, ' ');
            parsedInput += values + '\n';
          });
        });
      }
    }
    
    // 7. Multiple parameters (mixed types)
    else if (inputText.includes('=') && inputText.includes(',')) {
      // Handle multiple parameters
      const parts = inputText.split(',');
      parts.forEach(part => {
        part = part.trim();
        
        // Array parameter
        if (part.includes('[')) {
          const arrayMatch = part.match(/\[([^\]]+)\]/);
          if (arrayMatch) {
            const values = arrayMatch[1].replace(/,\s*/g, ' ');
            parsedInput += values + '\n';
          }
        }
        // String parameter
        else if (part.includes('"') || part.includes("'")) {
          const stringMatch = part.match(/["']([^"']+)["']/);
          if (stringMatch) {
            parsedInput += stringMatch[1] + '\n';
          }
        }
        // Numeric parameter
        else if (part.includes('=')) {
          const numMatch = part.match(/=\s*(\d+)/);
          if (numMatch) {
            parsedInput += numMatch[1] + '\n';
          }
        }
      });
    }
    
    // 8. Direct input (no parsing needed)
    else {
      parsedInput = inputText + '\n';
    }
    
    if (parsedInput) {
      processedInput = parsedInput;
    }
  }
  
  // Ensure input ends with newline if it contains data
  if (processedInput && !processedInput.endsWith('\n')) {
    processedInput += '\n';
  }

  const options = {
    method: "POST",
    url: "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: {
      language: language,
      stdin: processedInput,
      files: [
        {
          name: fileName,
          content: code.trim(),
        },
      ],
    },
    json: true,
  };

  request(options, function (error, response, body) {
    if (error) {
      console.error("API Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (response.statusCode !== 200) {
      console.error("API Response Error:", body);
      return res.status(response.statusCode).json({ 
        error: body.message || "Compilation failed",
        details: body
      });
    }

    // Transform OneCompiler response to match frontend expectations
    const actualOutput = body.stdout || "";
    const errorOutput = body.stderr || "";
    
    const result = {
      output: actualOutput.trim() || (errorOutput.trim() ? errorOutput.trim() : "(No output)"),
      error: errorOutput,
      stdout: actualOutput,
      stderr: errorOutput,
      statusCode: body.statusCode || 0
    };
    
    res.json(result);
  });
};

exports.getLanguages = (req, res) => {
  const languages = Object.keys(LANGUAGE_EXTENSIONS).map(lang => ({
    id: lang,
    name: lang.charAt(0).toUpperCase() + lang.slice(1),
    extension: LANGUAGE_EXTENSIONS[lang]
  }));

  res.json({
    success: true,
    languages: languages,
    count: languages.length
  });
};

exports.healthCheck = (req, res) => {
  const apiKey = process.env.ONECOMPILER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      success: false,
      message: "OneCompiler API key not configured"
    });
  }

  // Test with simple code
  const options = {
    method: "POST",
    url: "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: {
      language: "python",
      files: [
        {
          name: "test.py",
          content: "print('OK')",
        },
      ],
    },
    json: true,
  };

  request(options, function (error, response, body) {
    if (error) {
      return res.status(500).json({ 
        success: false,
        message: "OneCompiler API unreachable",
        error: error.message
      });
    }

    if (response.statusCode === 200) {
      return res.json({ 
        success: true,
        message: "OneCompiler API is working"
      });
    }

    res.status(response.statusCode).json({ 
      success: false,
      message: "OneCompiler API health check failed",
      error: body
    });
  });
};
