import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // generate + migrate in CI/CD (NOT push) — locked in eng review D8
} satisfies Config;
