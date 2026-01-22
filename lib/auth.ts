import "server-only";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./db";
import { AdminUser } from "./models";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const user = await AdminUser.findOne({ email: credentials.email as string });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export async function createAdminUser(
  email: string,
  password: string,
  name: string
) {
  await dbConnect();
  const passwordHash = await bcrypt.hash(password, 12);
  
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    return AdminUser.findOneAndUpdate(
      { email },
      { passwordHash, name },
      { new: true }
    );
  }
  
  return AdminUser.create({ email, passwordHash, name });
}
