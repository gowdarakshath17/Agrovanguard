const fs = require('fs');
const code = fs.readFileSync('src/api/ai.ts', 'utf-8');
const newCode = code.replace(
  'const { message } = req.body;',
  'const { message, language } = req.body;'
).replace(
  'systemInstruction: "You are a helpful agricultural AI assistant named CropSentinel. Give concise advice to farmers.",',
  'systemInstruction: `You are a helpful agricultural AI assistant named CropSentinel. Give concise advice to farmers.${language && language !== "English" ? " You MUST respond in " + language + "." : ""}`,'
);
fs.writeFileSync('src/api/ai.ts', newCode);
