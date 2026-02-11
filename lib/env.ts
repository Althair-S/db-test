import dotenv from "dotenv";

// Load environment variables from .env.local for standalone scripts/tests
dotenv.config({ path: ".env.local" });

/**
 * Database connection string.
 * Supports standard DATABASE_URL or legacy MONGODB_URI.
 */
export const DATABASE_URL =
  process.env.DATABASE_URL || process.env.MONGODB_URI || "";

/**
 * Authentication secret used by NextAuth/Auth.js.
 * Order of precedence: AUTH_SECRET (v5) > SECRET > NEXTAUTH_SECRET (v4).
 */
export const SECRET =
  process.env.AUTH_SECRET ||
  process.env.SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "";

/**
 * Application base URL.
 * Automatically detects Vercel environment or defaults to localhost.
 */
export const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
