import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { loginSchema } from '@/components/auth/login-form';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Email'
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Password'
        }
      },
      async authorize(credentials) {
        const { email, password } = credentials!;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword!
        );

        return passwordsMatch ? user : null;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      // If this is a new sign in, save the user id
      if (user) {
        token.id = user.id;
      }

      // If the session is being updated, fetch fresh user data
      if (trigger === 'update' && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true
          }
        });

        if (freshUser) {
          token.email = freshUser.email;
          token.name = freshUser.name;
          token.picture = freshUser.image;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string
        }
      };
    }
  }
};
