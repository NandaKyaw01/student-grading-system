
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      updatedAt: Date; 
    };
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    updatedAt: Date;
    authTime?: number;
  }
}
