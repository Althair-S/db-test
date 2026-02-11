import dotenv from "dotenv";

// Load environment variables from .env.local for standalone scripts/tests
dotenv.config({ path: ".env.local" });

export const DATABASE_URL =
  process.env.DATABASE_URL || process.env.MONGODB_URI || "";

export const SECRET =
  process.env.AUTH_SECRET ||
  process.env.SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "";

export const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
