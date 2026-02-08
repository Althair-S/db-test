import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "finance" | "user";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "finance" | "user";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "finance" | "user";
  }
}
