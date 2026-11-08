const fs = require('fs');
let code = fs.readFileSync('src/AppContent.tsx', 'utf-8');
code = code.replace(
  "import PestInfestationTracker from './components/Farm/PestInfestationTracker.tsx';",
  "import PestInfestationTracker from './components/Farm/PestInfestationTracker.tsx';"
);
// just a dummy replacement to trigger a re-check or I can just compile directly
