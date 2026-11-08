const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/GoogleAuth.tsx', 'utf-8');

// Replace signInWithPopup with signInWithRedirect
code = code.replace(
  "import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';",
  "import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';"
);

code = code.replace(
  'await signInWithPopup(auth, provider);',
  '// Use redirect instead of popup for better compatibility in iframes and mobile browsers\n      await signInWithRedirect(auth, provider);'
);

fs.writeFileSync('src/components/Auth/GoogleAuth.tsx', code);
