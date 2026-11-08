const fs = require('fs');
const code = fs.readFileSync('src/components/AI/RetailerRecommendations.tsx', 'utf-8');

const newCode = code.replace(
  '  const [retailers, setRetailers] = useState<Retailer[]>([]);',
  `  const [retailers, setRetailers] = useState<Retailer[]>(() => {
    try {
      const cached = localStorage.getItem('retailers_cache');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  });`
).replace(
  '          if (mounted) setRetailers(data.results || []);',
  '          if (mounted) {\n            setRetailers(data.results || []);\n            try { localStorage.setItem("retailers_cache", JSON.stringify(data.results || [])); } catch(e) {}\n          }'
);

fs.writeFileSync('src/components/AI/RetailerRecommendations.tsx', newCode);
