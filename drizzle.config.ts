import type { Config } from "drizzle-kit";
import { envConfig } from "./src/envConfig";

console.log("envConfig.DB_URL", envConfig.DB_URL);
export default {
  schema: ["./src/auth/entities/schema.ts", "./src/games/entities/schema.ts"],
  driver: "mysql2",
  dbCredentials: {
    uri: envConfig.DB_URL,
  },
  out: "./drizzle",
} satisfies Config;
