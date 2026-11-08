const fs = require('fs');
let code = fs.readFileSync('src/db/users.ts', 'utf-8');

code = code.replace(
  `      const result = await db.insert(users)
        .values({
          uid,
          email: email || null,
          phoneNumber: phoneNumber || null,
        })
        .returning();`,
  `      const result = await db.insert(users)
        .values({
          uid,
          email: email || null,
          phoneNumber: phoneNumber || null,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: email || null,
            phoneNumber: phoneNumber || null,
          }
        })
        .returning();`
);

// We need to also remove the manual catch and retry block if we do this, or just let it return the result.
// It's cleaner to rewrite the function.
