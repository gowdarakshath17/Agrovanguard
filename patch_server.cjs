const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes('pushRouter')) {
  code = code.replace(
    'import notificationsRouter from "./src/api/notifications.ts";',
    'import notificationsRouter from "./src/api/notifications.ts";\nimport pushRouter from "./src/api/push.ts";'
  );
  code = code.replace(
    '  app.use("/api/notifications", notificationsRouter);',
    '  app.use("/api/notifications", notificationsRouter);\n  app.use("/api/push", pushRouter);'
  );
  fs.writeFileSync('server.ts', code);
}
