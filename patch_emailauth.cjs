const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/EmailAuth.tsx', 'utf-8');

// The best way to "fix" this is simply to tell the user that the admin needs to enable it in the console, 
// rather than a hardcoded error assuming it will never work. But wait, I'll modify the error message 
// to be crystal clear that it's a console configuration issue.

code = code.replace(
  "case 'auth/operation-not-allowed':\n        return 'Email sign-in is disabled on this Firebase project. Please use Phone (OTP) or Quick Demo Access above.';",
  "case 'auth/operation-not-allowed':\n        return 'Email sign-in is disabled in your Firebase project. Please go to the Firebase Console -> Authentication -> Sign-in Method, and enable Email/Password.';"
);

fs.writeFileSync('src/components/Auth/EmailAuth.tsx', code);
