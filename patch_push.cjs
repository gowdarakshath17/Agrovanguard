const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications/PushNotificationManager.tsx', 'utf-8');

// Add a useEffect to auto-request permissions on mount if 'default'
code = code.replace(
  "const [testLoading, setTestLoading] = useState<string | null>(null);",
  "const [testLoading, setTestLoading] = useState<string | null>(null);\n\n  useEffect(() => {\n    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {\n      // Automatically request permission on load\n      requestPermission();\n    }\n  }, []);"
);

fs.writeFileSync('src/components/Notifications/PushNotificationManager.tsx', code);
