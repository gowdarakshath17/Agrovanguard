const fs = require('fs');
const code = fs.readFileSync('src/api/ai.ts', 'utf-8');
const newCode = code.replace(
  "console.error('AI Orchestration Error:', error);",
  "// Check if it's a 503 from Gemini\n    const is503 = error?.status === 503 || error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || (error?.message && error.message.includes('503')) || (error?.message && error.message.includes('UNAVAILABLE')) || (error?.message && error.message.includes('429')) || (error?.message && error.message.includes('RESOURCE_EXHAUSTED'));\n    if (!is503) { console.error('AI Orchestration Error:', error); }"
);
fs.writeFileSync('src/api/ai.ts', newCode);
