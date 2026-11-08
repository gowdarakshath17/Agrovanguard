export interface StoredAdvisory {
  id: string;
  title: string;
  cropType: string;
  category: 'DISEASE_DIAGNOSIS' | 'PEST_MANAGEMENT' | 'SOIL_NUTRIENTS' | 'WEATHER_SPRAY' | 'FIELD_PROTOCOL';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  timestamp: number;
  dateFormatted: string;
  source: 'AI Vision Scanner' | 'Regional Agronomic Protocol' | 'Automated Sensor Trigger';
  fieldName?: string;
  fieldId?: number;
  primaryPrediction: string;
  confidenceScore?: number;
  explanation: string;
  precautionaryMeasures: string;
  pesticideSuggestions?: string;
  organicRemedies?: string;
  soilFertilityAdvice?: string;
  irrigationAdvice?: string;
  bestSuitableWeather?: string;
  relatedDiseaseToOtherCrop?: string;
  marathiTranslation?: string;
  kannadaTranslation?: string;
  hindiTranslation?: string;
  audioAdviceText?: string;
  tags: string[];
  offlineAvailable: boolean;
}

const DB_NAME = 'AgroVanguardAdvisoriesDB';
const DB_VERSION = 1;
const STORE_NAME = 'advisories';

// Comprehensive default agricultural advisories for rural & staple crops
// Pre-seeded on first load so farmers have rich, actionable agronomic knowledge completely offline!
const DEFAULT_PRESEEDED_ADVISORIES: StoredAdvisory[] = [
  {
    id: 'adv_tomato_early_blight',
    title: 'Tomato Early Blight (Alternaria solani) Diagnosis & Protocol',
    cropType: 'Tomato',
    category: 'DISEASE_DIAGNOSIS',
    severity: 'CRITICAL',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'North Plot A - Tomato',
    fieldId: 1,
    primaryPrediction: 'Early Blight (Alternaria solani)',
    confidenceScore: 94,
    explanation: 'Alternaria solani creates characteristic dark brown concentric circular lesions with yellow halos on lower foliage, expanding rapidly under relative humidity above 80% and temperatures between 24°C-29°C. If unchecked, it causes defoliation and collar rot.',
    precautionaryMeasures: '1. Prune all lower infected leaves touching the soil surface and burn or bury away from the field.\n2. Ensure drip nozzles direct water to the root zone without splashing soil onto foliage.\n3. Maintain 60cm row spacing for canopy aeration.\n4. Avoid working in the field when foliage is wet from morning dew.',
    pesticideSuggestions: 'Chemical Treatment: Spray Mancozeb 75% WP @ 2.5g/L water or Chlorothalonil 75% WP @ 2g/L. In severe cases, alternate with Azoxystrobin 23% SC @ 1ml/L at 10-day intervals.',
    organicRemedies: 'Bio-Control: Apply Trichoderma harzianum or Pseudomonas fluorescens @ 10g/L foliar spray. Spray 5% Neem Seed Kernel Extract (NSKE) every 7 days as a preventative spore barrier.',
    soilFertilityAdvice: 'Avoid excessive nitrogen fertilization which creates lush, vulnerable tissue. Supplement with potassium silicate and calcium nitrate to strengthen leaf cell walls.',
    irrigationAdvice: 'Switch to early morning drip irrigation only. Terminate watering by 11:00 AM so the soil surface dries before evening humidity rises.',
    bestSuitableWeather: 'Clear, sunny days with relative humidity below 65% and wind speed between 5-10 km/h for spray applications.',
    relatedDiseaseToOtherCrop: 'Also infects Potato and Eggplant (Solanaceae family). Practice 3-year crop rotation with non-solanaceous crops like Maize or Legumes.',
    marathiTranslation: 'टोमॅटोचा करपा रोग (अल्टरनेरिया): पानांवर काळे गोल डाग दिसतात. मॅन्कोझेब २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून तात्काळ फवारणी करा.',
    kannadaTranslation: 'ಟೊಮೆಟೊ ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗ: ಎಲೆಗಳ ಮೇಲೆ ವೃತ್ತಾಕಾರದ ಕಂದು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಮ್ಯಾಂಕೋಜೆಬ್ ೨.೫ ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'टमाटर का अगेती झुलसा: पत्तियों पर भूरे छल्लेदार धब्बे। मैंकोजेब 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।',
    audioAdviceText: 'Tomato Early Blight detected. Prune infected lower foliage immediately. Spray Mancozeb at 2.5 grams per liter or organic Trichoderma harzianum. Irrigate strictly via drip in early mornings.',
    tags: ['Tomato', 'Early Blight', 'Alternaria', 'Fungicide', 'Mancozeb', 'Organic Neem'],
    offlineAvailable: true
  },
  {
    id: 'adv_rice_blast_leaf',
    title: 'Rice / Paddy Blast (Magnaporthe oryzae) Emergency Management',
    cropType: 'Rice / Paddy',
    category: 'DISEASE_DIAGNOSIS',
    severity: 'CRITICAL',
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 12).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'Wetland Sector B',
    fieldId: 2,
    primaryPrediction: 'Rice Blast (Magnaporthe oryzae)',
    confidenceScore: 91,
    explanation: 'Spindle-shaped elliptical lesions with grayish-white centers and dark brown borders on leaves. Spreads aggressively during cloudy, overcast days with dew periods exceeding 9 hours and high nitrogen presence.',
    precautionaryMeasures: '1. Drain standing water from the field for 24-48 hours to aerate soil and reduce microclimate humidity.\n2. Immediately halt top-dressing of urea or synthetic nitrogen.\n3. Burn infected stubble after harvest.\n4. Treat nursery seeds with Tricyclazole before transplantation.',
    pesticideSuggestions: 'Chemical: Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L or Kasugamycin 3% SL @ 2ml/L.',
    organicRemedies: 'Foliar spray of Pseudomonas fluorescens @ 10g/L or fermented cow urine (10% solution) mixed with Asafoetida (Hing) extract as a traditional bio-antifungal.',
    soilFertilityAdvice: 'Apply Potassium (Muriate of Potash - MOP) @ 25 kg/acre to harden epidermal tissue. Apply silicon fertilizer (calcium silicate) to form a physical leaf barrier.',
    irrigationAdvice: 'Maintain shallow water level (2-3 cm) rather than deep stagnation. Intermittent wetting and drying suppresses fungal proliferation.',
    bestSuitableWeather: 'Dry, sunny conditions. Do not spray during predicted rains or high wind drift.',
    relatedDiseaseToOtherCrop: 'Can jump to Finger Millet (Ragi) and Pearl Millet. Keep field bunds clean of grass weeds like Echinochloa.',
    kannadaTranslation: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ: ಎಲೆಯ ಮೇಲೆ ಕಣ್ಣಿನ ಆಕಾರದ ಕಲೆಗಳು. ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ ೦.೬ ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'धान का झुलसा रोग: पत्तियों पर आंख के आकार के धब्बे। ट्राइसाइक्लाजोल 0.6 ग्राम प्रति लीटर पानी में छिड़कें।',
    audioAdviceText: 'Rice Blast identified. Immediately stop nitrogen application and drain excess water for 24 hours. Spray Tricyclazole at point six grams per liter.',
    tags: ['Rice', 'Paddy', 'Blast', 'Tricyclazole', 'MOP', 'Wetland'],
    offlineAvailable: true
  },
  {
    id: 'adv_cotton_pink_bollworm',
    title: 'Cotton Pink Bollworm & Whitefly Integrated Pest Protocol',
    cropType: 'Cotton',
    category: 'PEST_MANAGEMENT',
    severity: 'HIGH',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'Black Soil Sector C',
    fieldId: 3,
    primaryPrediction: 'Pink Bollworm (Pectinophora gossypiella)',
    confidenceScore: 89,
    explanation: 'Larvae bore into cotton squares and green bolls, causing rosette flowers and premature dropping of bolls. Entrance holes plug with frass, staining lint and devastating crop quality.',
    precautionaryMeasures: '1. Install 5 pheromone traps (Gossyplure) per acre for monitoring. If catches exceed 8 moths/trap/night for 3 consecutive nights, trigger intervention.\n2. Handpick and destroy rosette flowers in early morning.\n3. Release Trichogramma bactrae egg parasitoids @ 60,000/acre at 10-day intervals.',
    pesticideSuggestions: 'Chemical: Spray Spinosad 45% SC @ 0.3ml/L or Emamectin Benzoate 5% SG @ 0.4g/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L targeting early larval instars.',
    organicRemedies: 'Apply Neem oil (10,000 ppm) @ 2ml/L with mild surfactant. Spray Beauveria bassiana @ 5g/L during late evening hours when humidity is favorable.',
    soilFertilityAdvice: 'Avoid late-season urea top dressing which keeps plants vegetative. Foliar spray 13-0-45 (Potassium Nitrate) @ 10g/L during boll development.',
    irrigationAdvice: 'Withhold excess irrigation to prevent canopy overgrowth; maintain alternate furrow irrigation.',
    bestSuitableWeather: 'Calm evening hours (post 4:00 PM) for bio-pesticide and chemical spraying to avoid pesticide evaporation.',
    relatedDiseaseToOtherCrop: 'Secondary hosts include Okra (Bhindi) and Hibiscus. Avoid planting Okra near Cotton plots.',
    kannadaTranslation: 'ಹತ್ತಿಯ ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ ಹುಳು: ಹೆಣ್ಣು ಪತಂಗಗಳ ಆಕರ್ಷಣೆಗೆ ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ. ಸ್ಪಿನೋಸ್ಯಾಡ್ ೦.೩ ಮಿಲಿ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'कपास की गुलाबी सुंडी: फेरोमोन ट्रैप लगाएं। स्पिनोसैड 0.3 मिली प्रति लीटर पानी का छिड़काव करें।',
    audioAdviceText: 'Cotton Pink Bollworm alert. Install 5 pheromone traps per acre. Spray Spinosad or Emamectin Benzoate in late evening.',
    tags: ['Cotton', 'Bollworm', 'Pheromone Trap', 'Spinosad', 'Neem Oil'],
    offlineAvailable: true
  },
  {
    id: 'adv_maize_fall_armyworm',
    title: 'Maize / Corn Fall Armyworm (Spodoptera frugiperda) Containment',
    cropType: 'Maize / Corn',
    category: 'PEST_MANAGEMENT',
    severity: 'CRITICAL',
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 36).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'Hill Plot D',
    fieldId: 4,
    primaryPrediction: 'Fall Armyworm (Spodoptera frugiperda)',
    confidenceScore: 92,
    explanation: 'Aggressive whorl feeding causing window-pane damage, skeletonized leaves, and heavy sawdust-like fecal frass in central whorls. Can destroy up to 70% of crop yield in whorl and tasseling stages.',
    precautionaryMeasures: '1. Hand application of dry soil or wood ash into whorls to physically suffocate young larvae.\n2. Plant 3-4 border rows of Napier grass or Cowpea as a trap crop.\n3. Intercrop with Desmodium for push-pull pest suppression.',
    pesticideSuggestions: 'Chemical: Directed whorl spray with Chlorantraniliprole 18.5% SC @ 0.4ml/L or Spinetoram 11.7% SC @ 0.5ml/L using knapsack sprayer with nozzle directed right into leaf whorls.',
    organicRemedies: 'Apply Bacillus thuringiensis (Bt kurstaki) @ 2g/L or Metarhizium rileyi @ 5g/L. Apply fine sand mixed with neem cake powder (9:1 ratio) directly into whorls.',
    soilFertilityAdvice: 'Ensure balanced fertilization. Zinc sulphate @ 10kg/acre soil application promotes robust seedling vigor to outgrow early larval defoliation.',
    irrigationAdvice: 'Light overhead sprinkler irrigation can displace young exposed larvae from upper leaf whorls.',
    bestSuitableWeather: 'Spray early in morning or dusk when larvae emerge to feed on upper leaf surfaces.',
    relatedDiseaseToOtherCrop: 'Feeds on Sorghum, Pearl Millet, and Sugarcane. Monitor adjacent cereal plots.',
    kannadaTranslation: 'ಮೆಕ್ಕೆಜೋಳದ ಲದ್ದಿ ಹುಳು: ಎಲೆ ಸುರುಳಿಯಲ್ಲಿ ಮರಳು ಅಥವಾ ಬೂದಿಯನ್ನು ಹಾಕಿ. ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ೦.೪ ಮಿಲಿ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'मक्के का फाल आर्मीवर्म: पत्ती की गोभ में सूखी राख या रेत डालें। क्लोरेंट्रानिलिप्रोल 0.4 मिली का छिड़काव करें।',
    audioAdviceText: 'Maize Fall Armyworm emergency. Direct chemical spray right into plant whorls with Chlorantraniliprole or apply wood ash in whorls.',
    tags: ['Maize', 'Corn', 'Armyworm', 'Whorl Spray', 'Bt', 'Ash'],
    offlineAvailable: true
  },
  {
    id: 'adv_wheat_rust_heat',
    title: 'Wheat Stripe / Yellow Rust & Terminal Heat Advisory',
    cropType: 'Wheat',
    category: 'DISEASE_DIAGNOSIS',
    severity: 'HIGH',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 48).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'Alluvial Flat A',
    fieldId: 5,
    primaryPrediction: 'Yellow Stripe Rust (Puccinia striiformis)',
    confidenceScore: 88,
    explanation: 'Bright yellow linear pustules arranged in parallel stripes along leaf veins. Releases yellow powdery spores on touch. Spreads through airborne spores across vast distances during cool nights and humid mornings.',
    precautionaryMeasures: '1. Monitor flag leaves daily during heading and grain filling.\n2. Plant rust-resistant seed cultivars (e.g. HD-2967, PBW-550, DBW-187).\n3. Avoid excess water stagnation which prolongs leaf wetness.',
    pesticideSuggestions: 'Chemical: Foliar spray of Propiconazole 25% EC (Tilt) @ 1ml/L or Tebuconazole 25.9% EC @ 1.25ml/L at the very first sighting of yellow stripes.',
    organicRemedies: 'Spray sour buttermilk (chaas) 10% solution mixed with copper plate infusion, or liquid seaweed extract @ 2ml/L to trigger systemic acquired resistance.',
    soilFertilityAdvice: 'Spray 0-0-50 (Potassium Sulphate) @ 15g/L during boot leaf stage to enhance heat and disease tolerance.',
    irrigationAdvice: 'Provide light irrigation during grain filling stage to counteract sudden temperature spikes (terminal heat stress).',
    bestSuitableWeather: 'Apply fungicides when foliage has dried in late morning under wind speeds below 12 km/h.',
    relatedDiseaseToOtherCrop: 'Can attack Barley and wild rye grasses. Eliminate wild grass weeds around borders.',
    kannadaTranslation: 'ಗೋಧಿಯ ಹಳದಿ ತುಕ್ಕು ರೋಗ: ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಗೆರೆಗಳು. ಪ್ರೊಪಿಕೊನಾಜೋಲ್ ೧ ಮಿಲಿ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'गेहूं का पीला रतुआ: पत्तियों पर पीली धारियां। प्रोपिकोनाजोल 1 मिली प्रति लीटर पानी का छिड़काव करें।',
    audioAdviceText: 'Wheat Yellow Rust detected. Immediately spray Propiconazole at one ml per liter and provide light irrigation against heat stress.',
    tags: ['Wheat', 'Yellow Rust', 'Propiconazole', 'Heat Stress', 'Potassium'],
    offlineAvailable: true
  },
  {
    id: 'adv_potato_late_blight',
    title: 'Potato Late Blight (Phytophthora infestans) Quarantine Advisory',
    cropType: 'Potato',
    category: 'DISEASE_DIAGNOSIS',
    severity: 'CRITICAL',
    timestamp: Date.now() - 1000 * 60 * 60 * 60,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 60).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'Valley Sector E',
    fieldId: 6,
    primaryPrediction: 'Late Blight (Phytophthora infestans)',
    confidenceScore: 96,
    explanation: 'Water-soaked irregular black/dark-brown lesions starting at leaf tips and margins, with delicate white fungal down on lower leaf surface under cool, foggy weather. Can wipe out entire fields within 4 days.',
    precautionaryMeasures: '1. Rogue and incinerate infected plants immediately.\n2. Ensure proper earthing-up to cover tubers under 10cm soil to prevent spore washdown.\n3. Dehaulm (cut foliage) 10-15 days before harvest if late blight is active.',
    pesticideSuggestions: 'Preventative: Mancozeb 75% WP @ 2.5g/L. Curative: Cymoxanil 8% + Mancozeb 64% WP @ 3g/L or Dimethomorph 50% WP @ 1g/L + Mancozeb @ 2g/L.',
    organicRemedies: 'Bordeaux mixture 1% spray as preventative. Copper hydroxide 77% WP @ 2g/L before fog/rain events.',
    soilFertilityAdvice: 'Avoid excess nitrogen. Ensure soil drainage by deepening furrow channels.',
    irrigationAdvice: 'Cease furrow flooding immediately. Keep soil moist but never waterlogged.',
    bestSuitableWeather: 'Requires prompt chemical coverage before forecasted cold drizzle or fog.',
    relatedDiseaseToOtherCrop: 'Attacks Tomato severely. Keep potato and tomato plots completely separated.',
    kannadaTranslation: 'ಆಲೂಗಡ್ಡೆ ತಡವಾದ ಅಂಗಮಾರಿ: ತಕ್ಷಣ ಸೈಮೋಕ್ಸಾನಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ ೩ ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'आलू का पछेती झुलसा: पत्तियों पर काले धब्बे और सफेद फफूंद। साइमोक्सानिल + मैंकोजेब 3 ग्राम प्रति लीटर का छिड़काव करें।',
    audioAdviceText: 'Potato Late Blight quarantine alert. Spray Cymoxanil plus Mancozeb at three grams per liter immediately. Stop all furrow flooding.',
    tags: ['Potato', 'Late Blight', 'Phytophthora', 'Mancozeb', 'Cymoxanil', 'Tubers'],
    offlineAvailable: true
  },
  {
    id: 'adv_soil_acid_nutrients',
    title: 'Soil Acid Lockout & Micro-Nutrient Remediation Advisory',
    cropType: 'All Crops',
    category: 'SOIL_NUTRIENTS',
    severity: 'HIGH',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 72).toLocaleDateString(),
    source: 'Automated Sensor Trigger',
    fieldName: 'Farm Wide Diagnostic',
    fieldId: 1,
    primaryPrediction: 'Soil pH Deficit (pH < 5.8) & Zinc Lockout',
    confidenceScore: 95,
    explanation: 'Low soil pH creates aluminum and iron toxicity while locking up essential Phosphorus, Zinc, and Magnesium ions. Symptoms show interveinal chlorosis, stunted root crowns, and poor response to standard NPK fertilizer.',
    precautionaryMeasures: '1. Broadcast agricultural limestone (calcium carbonate) or dolomite lime @ 250 kg/acre.\n2. Incorporate 5 tons of well-rotted farmyard manure (FYM) or vermicompost to boost soil organic buffer capacity.\n3. Avoid acidifying fertilizers like Ammonium Sulphate and Urea without liming.',
    pesticideSuggestions: 'Foliar Rescue: Spray chelated Zinc (Zn-EDTA 12%) @ 1g/L and Magnesium Sulphate @ 5g/L directly on foliage to bypass root acid lockout.',
    organicRemedies: 'Apply Wood Ash @ 100 kg/acre (rich in potassium and calcium carbonate). Inoculate with Phosphate Solubilizing Bacteria (PSB) @ 2 kg/acre mixed with compost.',
    soilFertilityAdvice: 'Test soil pH every season. Maintain soil organic carbon above 0.75% through green manuring with Sunnhemp (Crotalaria juncea) or Dhaincha.',
    irrigationAdvice: 'Irrigate immediately after lime application to activate calcium movement into the root zone.',
    bestSuitableWeather: 'Apply lime prior to pre-monsoon plowing or land preparation in moist soil.',
    relatedDiseaseToOtherCrop: 'Root rot pathogens thrive in compacted, acidic, poorly drained soils across all crops.',
    kannadaTranslation: 'ಮಣ್ಣಿನ ಆಮ್ಲತೆ ಸುಧಾರಣೆ: ಪ್ರತಿ ಎಕರೆಗೆ ೨೫೦ ಕೆಜಿ ಸುಣ್ಣವನ್ನು ಹಾಕಿ. ಸತು ಮತ್ತು ಮೆಗ್ನೀಸಿಯಮ್ ಸಿಂಪಡಿಸಿ.',
    hindiTranslation: 'मिट्टी का अम्लीय सुधार: प्रति एकड़ 250 किलो चूना डालें और जिंक व मैग्नीशियम का छिड़काव करें।',
    audioAdviceText: 'Soil acidity lockout advisory. Apply 250 kilograms of agricultural lime per acre. Spray chelated Zinc and Magnesium on leaves to bypass root lockout.',
    tags: ['Soil', 'pH', 'Lime', 'Zinc', 'NPK', 'Organic Compost'],
    offlineAvailable: true
  },
  {
    id: 'adv_weather_spray_windows',
    title: '48-Hour Microclimate Spray Window & Wind Drift Advisory',
    cropType: 'All Crops',
    category: 'WEATHER_SPRAY',
    severity: 'MODERATE',
    timestamp: Date.now() - 1000 * 60 * 60 * 80,
    dateFormatted: new Date(Date.now() - 1000 * 60 * 60 * 80).toLocaleDateString(),
    source: 'Regional Agronomic Protocol',
    fieldName: 'Microclimate Station',
    fieldId: 1,
    primaryPrediction: 'Safe Foliar Spray Window Protocol',
    confidenceScore: 97,
    explanation: 'Spraying pesticides or foliar fertilizers during high winds (>15 km/h) causes 40-60% chemical drift off-target, wasting money and contaminating surroundings. Spraying during hot noon hours causes rapid evaporation and chemical leaf burn.',
    precautionaryMeasures: '1. Optimal spray window: 6:30 AM to 9:30 AM or 4:30 PM to 6:30 PM.\n2. Ambient temperature must be between 18°C - 30°C.\n3. Relative humidity should ideally be between 50% - 75%.\n4. Wind velocity must be below 10 km/h.',
    pesticideSuggestions: 'Use drift-reduction air induction nozzles (02 or 03 orifice size) and maintain nozzle height 50 cm above crop canopy.',
    organicRemedies: 'Add organic surfactant / spreader (silicon-based spreader @ 0.3ml/L or soapnut extract) for uniform droplet spreading and rainfastness.',
    soilFertilityAdvice: 'Foliar micronutrient sprays absorb 80% better when stomata are open during cool morning hours.',
    irrigationAdvice: 'Ensure crop is adequately turgid (not drought-stressed) before spraying foliar chemicals to prevent leaf scorch.',
    bestSuitableWeather: 'Clear morning skies with light breeze (3-8 km/h). Never spray within 4 hours of expected rain.',
    relatedDiseaseToOtherCrop: 'Applies to all crops and orchard trees.',
    kannadaTranslation: 'ಸಿಂಪಡಣಾ ಮುನ್ಸೂಚನೆ: ಬೆಳಿಗ್ಗೆ ೬:೩೦ ರಿಂದ ೯:೩೦ ಅಥವಾ ಸಂಜೆ ೪:೩೦ ರಿಂದ ೬:೩೦ ರ ಒಳಗೆ ಸಿಂಪಡಿಸಿ. ಗಾಳಿಯ ವೇಗ ಕಡಿಮೆ ಇರಬೇಕು.',
    hindiTranslation: 'छिड़काव समय सलाह: सुबह 6:30 से 9:30 या शाम 4:30 से 6:30 के बीच छिड़काव करें। तेज हवा में छिड़काव न करें।',
    audioAdviceText: 'Weather spray window protocol. Spray only in early mornings or evenings when wind speed is below 10 kilometers per hour to prevent chemical drift.',
    tags: ['Weather', 'Spray Window', 'Wind Drift', 'Surfactant', 'Nozzle', 'Safety'],
    offlineAvailable: true
  }
];

// Open / initialize IndexedDB instance
export function openAdvisoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('cropType', 'cropType', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });

        // Populate initial default advisories
        DEFAULT_PRESEEDED_ADVISORIES.forEach(item => {
          store.add(item);
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Ensure the DB has pre-seeded items if opened previously without them
export async function ensurePreseededAdvisories(): Promise<void> {
  try {
    const db = await openAdvisoryDB();
    const existing = await getAllStoredAdvisories();
    if (existing.length === 0) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      DEFAULT_PRESEEDED_ADVISORIES.forEach(item => store.put(item));
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    }
  } catch (err) {
    console.warn('Failed to ensure preseeded advisories in IndexedDB:', err);
  }
}

// Save or update an agricultural advisory to IndexedDB
export async function saveAdvisoryToIndexedDB(advisory: StoredAdvisory): Promise<void> {
  const db = await openAdvisoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({
      ...advisory,
      offlineAvailable: true,
      timestamp: advisory.timestamp || Date.now()
    });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Retrieve all stored advisories from IndexedDB
export async function getAllStoredAdvisories(): Promise<StoredAdvisory[]> {
  try {
    const db = await openAdvisoryDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as StoredAdvisory[];
        // Sort newest first
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read error, returning default fallback advisories:', err);
    return DEFAULT_PRESEEDED_ADVISORIES;
  }
}

// Retrieve advisories matching a crop type
export async function getStoredAdvisoriesByCrop(cropType: string): Promise<StoredAdvisory[]> {
  const all = await getAllStoredAdvisories();
  if (!cropType || cropType.toLowerCase() === 'all') return all;
  return all.filter(a => 
    a.cropType.toLowerCase().includes(cropType.toLowerCase()) || 
    a.cropType.toLowerCase() === 'all crops'
  );
}

// Retrieve an advisory by ID
export async function getStoredAdvisoryById(id: string): Promise<StoredAdvisory | null> {
  const db = await openAdvisoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// Delete an advisory
export async function deleteStoredAdvisory(id: string): Promise<void> {
  const db = await openAdvisoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Helper to convert scan diagnosis result into StoredAdvisory format
export function convertDiagnosisToAdvisory(
  cropType: string,
  fieldId: number,
  fieldName: string,
  diagnosisResult: any
): StoredAdvisory {
  const d = diagnosisResult?.disease || diagnosisResult?.pest;
  const diseaseName = d?.primaryPrediction || 'Crop Health Observation';
  const id = `scan_${Date.now()}_${cropType.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  
  return {
    id,
    title: `${cropType}: ${diseaseName} Diagnostic Advisory`,
    cropType: cropType || 'General Crop',
    category: 'DISEASE_DIAGNOSIS',
    severity: (d?.severity as any) || (d?.confidenceScore > 80 ? 'HIGH' : 'MODERATE'),
    timestamp: Date.now(),
    dateFormatted: new Date().toLocaleDateString(),
    source: 'AI Vision Scanner',
    fieldName: fieldName || `Field #${fieldId}`,
    fieldId,
    primaryPrediction: diseaseName,
    confidenceScore: d?.confidenceScore || 85,
    explanation: d?.explanation || 'Field diagnostic assessment captured via camera scan.',
    precautionaryMeasures: d?.precautionaryMeasures || 'Monitor symptoms daily and maintain field cleanliness.',
    pesticideSuggestions: d?.pesticideSuggestions,
    soilFertilityAdvice: d?.soilFertilityAdvice,
    irrigationAdvice: d?.irrigationAdvice,
    bestSuitableWeather: d?.bestSuitableWeather,
    relatedDiseaseToOtherCrop: d?.relatedDiseaseToOtherCrop,
    kannadaTranslation: d?.kannadaTranslation,
    audioAdviceText: `${cropType} diagnosis: ${diseaseName}. ${d?.explanation || ''} Precaution: ${d?.precautionaryMeasures || ''}`,
    tags: [cropType, diseaseName, 'Scanner Scan'],
    offlineAvailable: true
  };
}
