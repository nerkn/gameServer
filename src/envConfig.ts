import { z } from "zod";

const envSchema = z.object({
  DB_URL: z.string().url().min(1),
  JWT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  MAILJET_b64: z.string(),
});

export const envConfig = envSchema.parse(process.env);
