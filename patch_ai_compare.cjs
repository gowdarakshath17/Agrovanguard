const fs = require('fs');
let code = fs.readFileSync('src/api/ai.ts', 'utf-8');

const compareRoute = `
router.post('/compare-crops', requireAuth, async (req: Request, res: Response) => {
  try {
    const { crop1, crop2 } = req.body;
    if (!crop1 || !crop2) {
      return res.status(400).json({ error: 'Missing crop1 or crop2' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash',
      contents: \`Compare the crops "\${crop1}" and "\${crop2}" for a farmer. Provide the comparison strictly as a JSON object with this exact schema:
{
  "crop1": {
    "name": "\${crop1}",
    "diseaseResistance": "Brief description of typical disease resistance and common vulnerabilities.",
    "waterRequirements": "Brief description of water needs (e.g. mm/season or irrigation frequency).",
    "pesticideSchedule": "Brief description of optimal pesticide or treatment schedule."
  },
  "crop2": {
    "name": "\${crop2}",
    "diseaseResistance": "Brief description of typical disease resistance and common vulnerabilities.",
    "waterRequirements": "Brief description of water needs (e.g. mm/season or irrigation frequency).",
    "pesticideSchedule": "Brief description of optimal pesticide or treatment schedule."
  }
}\`,
      config: {
        responseMimeType: "application/json",
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Crop Comparison Error:', error);
    res.status(500).json({ error: 'Failed to compare crops', message: error.message });
  }
});

export default router;
`;

code = code.replace('export default router;', compareRoute);
fs.writeFileSync('src/api/ai.ts', code);
