const fs = require('fs');
const code = fs.readFileSync('src/components/AI/ScannerWidget.tsx', 'utf-8');

const newCode = code.replace(
  '  const [result, setResult] = useState<OrchestratorResponse | null>(null);',
  `  const [result, setResult] = useState<OrchestratorResponse | null>(() => {
    // Attempt to load cached report for this field on open
    try {
      const cached = localStorage.getItem(\`crop_report_\${fieldId}\`);
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return null;
  });`
).replace(
  '        setResult(data);',
  '        setResult(data);\n        // Cache it offline\n        try { localStorage.setItem(`crop_report_${fieldId}`, JSON.stringify(data)); } catch(e) {}'
);

fs.writeFileSync('src/components/AI/ScannerWidget.tsx', newCode);
