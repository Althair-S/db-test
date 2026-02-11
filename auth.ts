import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import connect from "./lib/db";
import User from "./models/User";
import bcrypt from "bcryptjs";

// Default admin account (tidak perlu database)
// Gunakan ini untuk login pertama kali setelah deployment
const DEFAULT_ADMIN = {
  email: "superadmin@system.local",
  password: "SuperAdmin123!@#", // Ganti password ini di production!
  name: "Super Admin",
  role: "admin" as const,
  id: "default-admin-id",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        // Check default admin first (tidak perlu database)
        if (email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) {
          if (password === DEFAULT_ADMIN.password) {
            console.log("✅ Default admin login successful");
            return {
              id: DEFAULT_ADMIN.id,
              email: DEFAULT_ADMIN.email,
              name: DEFAULT_ADMIN.name,
              role: DEFAULT_ADMIN.role,
            };
          } else {
            throw new Error("Invalid email or password");
          }
        }

        // Check database users
        try {
          await connect();
          const user = await User.findOne({ email: email.toLowerCase() });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          // Jika database error, tetap bisa login dengan default admin
          console.error("Database error:", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
});
