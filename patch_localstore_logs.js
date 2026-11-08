import fs from 'fs';

let content = fs.readFileSync('src/db/localStore.ts', 'utf8');

// Add activityLogs to data structure
if (!content.includes('activityLogs: any[]')) {
  content = content.replace(
    /interventions: any\[\];\n  \}/,
    'interventions: any[];\n    activityLogs: any[];\n  }'
  );
  
  content = content.replace(
    /interventions: \[\]\,/,
    'interventions: [],\n        activityLogs: [],'
  );
  
  content = content.replace(
    /interventions: 1\,/,
    'interventions: 1,\n        activityLogs: 1,'
  );
}

// Add logActivity method
if (!content.includes('logActivity(')) {
  const methodCode = `
  logActivity(uid: string, action: string, details: string) {
    const user = this.getUserByUid(uid);
    const log = {
      id: this.data.nextId.activityLogs++,
      userId: user?.id || 0,
      uid,
      email: user?.email || uid,
      action,
      details,
      timestamp: new Date()
    };
    if (!this.data.activityLogs) this.data.activityLogs = [];
    this.data.activityLogs.unshift(log);
    // Keep only last 100 logs to prevent unbounded growth
    if (this.data.activityLogs.length > 100) {
      this.data.activityLogs.pop();
    }
    this.save();
  }
`;
  content = content.replace(/getOrCreateUser\(/, methodCode + '\n  getOrCreateUser(');
}

fs.writeFileSync('src/db/localStore.ts', content);
