const fs = require('fs');
let code = fs.readFileSync('src/components/Profile/UserProfile.tsx', 'utf-8');

// Replace all profile.profileEditsLeft with profile?.profileEditsLeft
code = code.replace(/profile\.profileEditsLeft/g, '(profile?.profileEditsLeft ?? 0)');

fs.writeFileSync('src/components/Profile/UserProfile.tsx', code);
