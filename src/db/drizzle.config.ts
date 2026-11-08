import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!sqlHost || !sqlDbName || !user || !password) {
  console.warn("Missing SQL admin credentials. Drizzle config will fail if performing migrations.");
} else {
  console.log(`Using user: ${user} to connect to database.`);
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    host: sqlHost || 'localhost',
    user: user || 'admin',
    password: password || 'admin',
    database: sqlDbName || 'db',
    ssl: false,
  },
  verbose: true,
});
