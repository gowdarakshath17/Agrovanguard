const fs = require('fs');
let code = fs.readFileSync('src/AppContent.tsx', 'utf-8');

if (!code.includes('SoilFertilityRisk')) {
  code = code.replace(
    "import SoilFertilityChart from './components/Farm/SoilFertilityChart.tsx';",
    "import SoilFertilityChart from './components/Farm/SoilFertilityChart.tsx';\nimport SoilFertilityRisk from './components/Farm/SoilFertilityRisk.tsx';"
  );

  code = code.replace(
    '<FertilizerEstimator />',
    '<SoilFertilityRisk />\n            <FertilizerEstimator />'
  );

  fs.writeFileSync('src/AppContent.tsx', code);
}
