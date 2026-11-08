const fs = require('fs');
const content = fs.readFileSync('src/api/farms.ts', 'utf8');
const replaced = content.replace(
  /    if \(firestoreDb\) \{\n      const farmsSnapshot = await firestoreDb.collection\('users'\)\.doc\(user\.uid\)\.collection\('farms'\)\.get\(\);\n      \n      const userFarms: any\[\] = \[\];\n      farmsSnapshot\.forEach\(\(doc: any\) => \{\n        userFarms\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n      \}\);\n      if \(userFarms\.length > 0\) \{\n        return res\.json\(userFarms\);\n      \}\n    \}/g,
  `    if (firestoreDb) {
      try {
        const farmsSnapshot = await firestoreDb.collection('users').doc(user.uid).collection('farms').get();
        
        const userFarms: any[] = [];
        farmsSnapshot.forEach((doc: any) => {
          userFarms.push({ id: doc.id, ...doc.data() });
        });
        if (userFarms.length > 0) {
          return res.json(userFarms);
        }
      } catch (err: any) {
        console.warn('Firestore farms read failed:', err.message);
      }
    }`
);
fs.writeFileSync('src/api/farms.ts', replaced);
