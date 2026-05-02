// ---------------------------------------------------------------------------
// Centralised environment-variable validation
//
// Import this module at the top of any server-side entrypoint that depends on
// env vars so misconfiguration is surfaced immediately at startup rather than
// surfacing as a cryptic runtime error mid-request.
//
// Usage:
//   import "@/lib/env";
// ---------------------------------------------------------------------------

type EnvRequirement = {
  key: string;
  /** If true the app will throw when NODE_ENV=production and the var is absent */
  requiredInProd: boolean;
  /** Short description for the error message */
  description: string;
};

const ENV_REQUIREMENTS: EnvRequirement[] = [
  {
    key: "AUTH_SECRET",
    requiredInProd: true,
    description: "NextAuth signing secret (generate with: openssl rand -base64 32)",
  },
  {
    key: "UPSTASH_REDIS_REST_URL",
    requiredInProd: true,
    description: "Upstash Redis REST URL for rate-limiting and OTP storage",
  },
  {
    key: "UPSTASH_REDIS_REST_TOKEN",
    requiredInProd: true,
    description: "Upstash Redis REST token",
  },
  {
    key: "AWS_ACCESS_KEY_ID",
    requiredInProd: true,
    description: "AWS credentials for Amazon Rekognition (identity verification)",
  },
  {
    key: "AWS_SECRET_ACCESS_KEY",
    requiredInProd: true,
    description: "AWS credentials for Amazon Rekognition",
  },
  {
    key: "EDENAI_API_KEY",
    requiredInProd: true,
    description: "Eden AI API key for OCR / identity_parser",
  },
  // Optional in prod (Google OAuth is additive)
  {
    key: "GOOGLE_CLIENT_ID",
    requiredInProd: false,
    description: "Google OAuth client ID (enables Google Sign-In)",
  },
  {
    key: "GOOGLE_CLIENT_SECRET",
    requiredInProd: false,
    description: "Google OAuth client secret",
  },
  {
    key: "AWS_REGION",
    requiredInProd: false,
    description: "AWS region for Rekognition (defaults to us-east-1)",
  },
];

const isProd = process.env.NODE_ENV === "production";

const missing: string[] = ENV_REQUIREMENTS.filter(
  ({ key, requiredInProd }) => requiredInProd && isProd && !process.env[key],
).map(({ key, description }) => `  • ${key} — ${description}`);

if (missing.length > 0) {
  throw new Error(
    `[env] Missing required production environment variables:\n${missing.join("\n")}\n\n` +
      "See .env.example for the full list of expected variables.",
  );
}

// Warn (never throw) about missing optional vars so developers notice them
const missingOptional: string[] = ENV_REQUIREMENTS.filter(
  ({ key, requiredInProd }) =>
    !requiredInProd && !isProd && !process.env[key],
).map(({ key }) => key);

if (missingOptional.length > 0 && process.env.NODE_ENV !== "test") {
  console.warn(
    `[env] Optional environment variables not set (some features will be disabled): ${missingOptional.join(", ")}`,
  );
}
