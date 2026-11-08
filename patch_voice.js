const fs = require('fs');
const code = fs.readFileSync('src/api/voice.ts', 'utf-8');
const newCode = code.replace(
  "if (language === 'Tamil') voiceName = 'Puck';",
  "if (language === 'Tamil') voiceName = 'Puck';\n    if (language === 'Kannada') voiceName = 'Fenrir';"
);
fs.writeFileSync('src/api/voice.ts', newCode);
