import React from 'react';

export default function CodeEditor({ value, onChange, language }) {
  return (
    <textarea
      className="editor"
      spellCheck={false}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={language ? `// ${language}` : '// Write your code here'}
    />
  );
}


