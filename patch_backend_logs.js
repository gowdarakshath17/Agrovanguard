import fs from 'fs';

// Patch Users
let usersContent = fs.readFileSync('src/api/users.ts', 'utf8');
if (!usersContent.includes("localStore.logActivity(user.uid as string, 'LOGIN',")) {
  usersContent = usersContent.replace(
    /res\.json\(dbUser\);/,
    `localStore.logActivity(user.uid as string, 'LOGIN', 'User accessed profile/dashboard');
    res.json(dbUser);`
  );
  fs.writeFileSync('src/api/users.ts', usersContent);
}

// Patch IoT
let iotContent = fs.readFileSync('src/api/iot.ts', 'utf8');
if (!iotContent.includes("localStore.logActivity(user?.uid as string, 'DEVICE_TOGGLE',")) {
  iotContent = iotContent.replace(
    /localStore\.saveIntervention\(\{ fieldId/,
    `localStore.logActivity(user?.uid as string, 'DEVICE_TOGGLE', \`Triggered \${action} on device \${deviceId}\`);
    localStore.saveIntervention({ fieldId`
  );
  fs.writeFileSync('src/api/iot.ts', iotContent);
}

// Patch Farms stats to return activityLogs
let farmsContent = fs.readFileSync('src/api/farms.ts', 'utf8');
farmsContent = farmsContent.replace(
  /recentSearches: localStore\.data\.users\.map[\s\S]*?\)\)/,
  `recentSearches: localStore.data.activityLogs || []`
);
fs.writeFileSync('src/api/farms.ts', farmsContent);

