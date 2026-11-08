const fs = require('fs');
let code = fs.readFileSync('src/AppContent.tsx', 'utf-8');

if (!code.includes('EcoPesticideScheduler')) {
  code = code.replace(
    "import PestInfestationTracker from './components/Farm/PestInfestationTracker.tsx';",
    "import PestInfestationTracker from './components/Farm/PestInfestationTracker.tsx';\nimport EcoPesticideScheduler from './components/Farm/EcoPesticideScheduler.tsx';"
  );

  code = code.replace(
    '<PestInfestationTracker />',
    '<PestInfestationTracker />\n            <EcoPesticideScheduler />'
  );

  fs.writeFileSync('src/AppContent.tsx', code);
}
