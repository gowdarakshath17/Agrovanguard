const fs = require('fs');
let code = fs.readFileSync('src/components/Profile/UserProfile.tsx', 'utf-8');

code = code.replace(
  "import { useAuth } from '../../context/AuthContext.tsx';",
  "import { useAuth } from '../../context/AuthContext.tsx';\nimport GoogleSheetsSync from './GoogleSheetsSync.tsx';"
);

code = code.replace(
  '          </form>',
  '          </form>\n          <GoogleSheetsSync userProfile={profile} />'
);

fs.writeFileSync('src/components/Profile/UserProfile.tsx', code);
