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
  // ----- Auth ---------------------------------------------------------------
  // Optional for now so preview / demo deployments work without a secret.
  // Set this before going to production.
  {
    key: "AUTH_SECRET",
    requiredInProd: false,
    description: "NextAuth signing secret (generate with: openssl rand -base64 32)",
  },

  // ----- Upstash Redis (rate limiting & OTP) --------------------------------
  // Not yet provisioned — rate limiting and OTP gracefully degrade to demo mode.
  {
    key: "UPSTASH_REDIS_REST_URL",
    requiredInProd: false,
    description: "Upstash Redis REST URL for rate-limiting and OTP storage",
  },
  {
    key: "UPSTASH_REDIS_REST_TOKEN",
    requiredInProd: false,
    description: "Upstash Redis REST token",
  },

  // ----- AWS Rekognition (identity / face-match) ----------------------------
  // Not yet provisioned — identity verification endpoints return 503 in demo mode.
  {
    key: "AWS_ACCESS_KEY_ID",
    requiredInProd: false,
    description: "AWS credentials for Amazon Rekognition (identity verification)",
  },
  {
    key: "AWS_SECRET_ACCESS_KEY",
    requiredInProd: false,
    description: "AWS credentials for Amazon Rekognition",
  },
  {
    key: "AWS_REGION",
    requiredInProd: false,
    description: "AWS region for Rekognition (defaults to us-east-1)",
  },

  // ----- Eden AI (OCR) ------------------------------------------------------
  // Not yet provisioned — OCR endpoint returns 503 in demo mode.
  {
    key: "EDENAI_API_KEY",
    requiredInProd: false,
    description: "Eden AI API key for OCR / identity_parser",
  },

  // ----- Google OAuth (additive) -------------------------------------------
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
