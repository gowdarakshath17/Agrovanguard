import fs from 'fs';

const content = fs.readFileSync('src/AppContent.tsx', 'utf8');

if (!content.includes("import AdminDashboard")) {
  let updated = content.replace(
    /import { PWAInstallButton } from '\.\/components\/PWA\/PWAInstallButton\.tsx';/,
    "import AdminDashboard from './components/Admin/AdminDashboard.tsx';\nimport { PWAInstallButton } from './components/PWA/PWAInstallButton.tsx';"
  );
  
  updated = updated.replace(
    /  if \(!user\) \{\n    return <AuthContainer \/>;\n  \}/,
    `  if (!user) {
    return <AuthContainer />;
  }

  // Admin routing
  if (profile?.role === 'ADMIN') {
    return <AdminDashboard />;
  }`
  );
  
  fs.writeFileSync('src/AppContent.tsx', updated);
}
