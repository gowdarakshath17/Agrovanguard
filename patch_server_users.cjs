const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes('usersRouter')) {
  code = code.replace(
    'import pushRouter from "./src/api/push.ts";',
    'import pushRouter from "./src/api/push.ts";\nimport usersRouter from "./src/api/users.ts";'
  );
  code = code.replace(
    '  app.use("/api/push", pushRouter);',
    '  app.use("/api/push", pushRouter);\n  app.use("/api/users", usersRouter);'
  );
  fs.writeFileSync('server.ts', code);
}
