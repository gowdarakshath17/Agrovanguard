const fs = require('fs');
const code = fs.readFileSync('src/components/AI/AssistantModal.tsx', 'utf-8');

const newCode = code.replace(
  'console.error("Speech recognition error", event.error);',
  'console.error("Speech recognition error", event.error);\n        if (event.error === "not-allowed") {\n          alert("Microphone access is blocked. Please allow microphone permissions in your browser to use voice input.");\n        }'
);

fs.writeFileSync('src/components/AI/AssistantModal.tsx', newCode);
