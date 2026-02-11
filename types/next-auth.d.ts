declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    name: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
