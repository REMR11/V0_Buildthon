import "@/lib/env"; // validate required env vars at startup
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Mock user store — replace with real DB query when Supabase/Neon is wired up
// ---------------------------------------------------------------------------
const MOCK_USERS = [
  {
    id: "1",
    email: "demo@nidoo.com",
    // bcrypt hash of "password123"
    passwordHash:
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.i",
    name: "Demo Usuario",
    role: "propietario" as const,
  },
];

async function getUserByEmail(email: string) {
  return MOCK_USERS.find((u) => u.email === email) ?? null;
}

// Warn (not throw) when AUTH_SECRET is absent so preview and demo deployments
// continue to work. Add AUTH_SECRET before going to production.
if (!process.env.AUTH_SECRET) {
  console.warn(
    "[auth] AUTH_SECRET is not set. Sessions will use an insecure fallback. " +
      "Set AUTH_SECRET before deploying to production.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "nidoo-demo-fallback-not-for-production",
  providers: [
    // --- Google OAuth (requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) ---
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // --- Email / password credentials ---
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        // Basic type guards — reject non-string or suspiciously long values
        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          email.length > 254 ||
          password.length > 128 ||
          !email ||
          !password
        ) {
          return null;
        }

        const user = await getUserByEmail(email);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
