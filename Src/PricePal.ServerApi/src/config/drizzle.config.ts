import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/db/migrations/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
