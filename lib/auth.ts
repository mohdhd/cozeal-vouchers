import "server-only";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "./db";
import { AdminUser } from "./models";
import { User } from "./models/User";

// Extend the User type for NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
    institutionId?: string;
    phone?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      institutionId?: string;
      phone?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role?: string;
    institutionId?: string;
    phone?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Admin credentials provider
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
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
          role: "ADMIN",
        };
      },
    }),
    // User credentials provider (individuals and institution contacts)
    CredentialsProvider({
      id: "user-credentials",
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
          isActive: true,
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId?.toString(),
          phone: user.phone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.institutionId = user.institutionId;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.institutionId = token.institutionId;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
});

// Admin user functions
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

// Public user functions
export async function createUser(
  email: string,
  password: string,
  name: string,
  phone?: string,
  role: "INDIVIDUAL" | "INSTITUTION_CONTACT" = "INDIVIDUAL",
  institutionId?: string
) {
  await dbConnect();
  const passwordHash = await bcrypt.hash(password, 12);
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name,
    phone,
    role,
    institutionId,
    emailVerificationToken,
    emailVerificationExpires,
  });

  return { user, emailVerificationToken };
}

export async function verifyUserEmail(token: string): Promise<boolean> {
  await dbConnect();

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    return false;
  }

  await User.findByIdAndUpdate(user._id, {
    emailVerified: true,
    emailVerifiedAt: new Date(),
    $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
  });

  return true;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  await dbConnect();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: token,
    passwordResetExpires: expires,
  });

  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  await dbConnect();

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return false;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await User.findByIdAndUpdate(user._id, {
    passwordHash,
    $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
  });

  return true;
}

export async function getUserById(id: string) {
  await dbConnect();
  return User.findById(id).lean();
}

export async function getUserByEmail(email: string) {
  await dbConnect();
  return User.findOne({ email: email.toLowerCase() }).lean();
}
