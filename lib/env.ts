import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Load .env.local specifically for Next.js dev environment if needed, or rely on default .env

export const DATABASE_URL: string =
  process.env.DATABASE_URL || process.env.MONGODB_URI || "";
export const SECRET: string =
  process.env.SECRET || process.env.NEXTAUTH_SECRET || "";
export const CLIENT_HOST: string =
  process.env.CLIENT_HOST || "http://localhost:3000";
