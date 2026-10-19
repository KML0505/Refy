import { z } from "zod";

const schema = z.object({
  PAYPAL_CLIENT_ID: z.string().min(1),
  PAYPAL_CLIENT_SECRET: z.string().min(1),
  AI_API_KEY: z.string().optional(),
});

export const env = schema.parse(process.env);