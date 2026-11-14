/**
 * This is the file for the important variable configurations. It reads an .env file in the same directory, 
 * reads it, verifies the data schema using zod, and is exported as settings to be shared across the program. 
 */


import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from the current directory
dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });
dotenv.config();

// Define the schema (equivalent to Pydantic BaseSettings)
const settingsSchema = z.object({
  // Enforce type safety and coercion
  HASH_ALGORITHM: z.string().default('HS256'),
  SECRET_KEY: z.string(),
  ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce.number().default(30),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string(),
});

// Parse and validate process.env against the schema
const parseSettings = () => {
  const result = settingsSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration.');
  }

  return result.data;
};

// Single instantiated source of truth
export const settings = parseSettings();