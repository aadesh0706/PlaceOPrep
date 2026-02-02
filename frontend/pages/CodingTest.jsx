import { useState } from 'react';
import CodeEditor from '../components/CodeEditor';

export default function CodingTest() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const handleCodeChange = (newCode, language) => {
    setCode(newCode);
    console.log('Code changed:', { code: newCode, language });
  };

  const handleSubmit = async ({ code, language }) => {
    setLoading(true);
    console.log('Submitting code:', { code, language });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    
    return {
      output: `Code submitted successfully!\n\nLanguage: ${language}\nCode length: ${code.length} characters\n\nNote: This is a test. In production, this would execute your code and return the actual results.`
    };
  };

  return (
    <div className="h-screen">
      <CodeEditor
        question={null}
        language="python"
        onCodeChange={handleCodeChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
