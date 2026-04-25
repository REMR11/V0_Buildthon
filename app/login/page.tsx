"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Google "G" icon — Chrome was removed from lucide-react
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Design tokens (match onboarding palette) ─────────────────────────────
const T = {
  primary:     "#D85A30",
  primaryHov:  "#BF4D26",
  primaryFg:   "#FFFFFF",
  bg:          "#FDF8F4",
  card:        "#FFFFFF",
  foreground:  "#2C1A0E",
  muted:       "#8C7B6E",
  mutedBg:     "#F5EDE6",
  border:      "#E8D5C4",
  borderFocus: "#D85A30",
  success:     "#2D8A4E",
  successBg:   "#EBF7EF",
  error:       "#C0392B",
  errorBg:     "#FDEDEB",
  infoBg:      "#FEF3EE",
};

// ─── Zod schemas ──────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const recoverSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "Solo se permiten números"),
});

type LoginData   = z.infer<typeof loginSchema>;
type RecoverData = z.infer<typeof recoverSchema>;
type OtpData     = z.infer<typeof otpSchema>;

type View = "login" | "recover" | "otp" | "success";

// ─── Shared primitives ────────────────────────────────────────────────────
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold mb-1.5" style={{ color: T.foreground }}>
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs font-medium" style={{ color: T.error }}>
      <AlertCircle size={12} /> {message}
    </p>
  );
}

function InputBase({
  id, type = "text", placeholder, error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      style={{
        border: `1.5px solid ${error ? T.error : T.border}`,
        borderRadius: 12,
        background: T.card,
        color: T.foreground,
        outline: "none",
        width: "100%",
        padding: "11px 14px",
        fontSize: 15,
        transition: "border-color 0.15s",
      }}
      onFocus={e  => { e.currentTarget.style.borderColor = error ? T.error : T.borderFocus; }}
      onBlur={e   => { e.currentTarget.style.borderColor = error ? T.error : T.border; }}
      {...rest}
    />
  );
}

function PrimaryBtn({
  children, loading, disabled, type = "button", onClick, fullWidth = true,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        background: disabled || loading ? `${T.primary}80` : T.primary,
        color: T.primaryFg,
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 15,
        padding: "13px 24px",
        width: fullWidth ? "100%" : undefined,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLButtonElement).style.background = T.primaryHov;
      }}
      onMouseLeave={e => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLButtonElement).style.background = T.primary;
      }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full mx-auto"
      style={{
        maxWidth: 440,
        background: T.card,
        borderRadius: 24,
        border: `1.5px solid ${T.border}`,
        boxShadow: "0 4px 32px 0 rgba(44,26,14,0.08)",
        padding: "36px 32px",
      }}
    >
      {children}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-semibold mb-5 transition-colors"
      style={{ color: T.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.primary; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.muted; }}
    >
      <ArrowLeft size={15} /> Volver
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <hr style={{ flex: 1, border: "none", borderTop: `1px solid ${T.border}` }} />
      <span className="text-xs font-medium" style={{ color: T.muted }}>o continúa con</span>
      <hr style={{ flex: 1, border: "none", borderTop: `1px solid ${T.border}` }} />
    </div>
  );
}

function AlertBanner({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error";
  return (
    <div
      className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-medium"
      style={{
        background: isError ? T.errorBg : T.successBg,
        color:      isError ? T.error   : T.success,
        border:     `1px solid ${isError ? "#F1A89E" : "#9FDBB8"}`,
      }}
    >
      {isError
        ? <AlertCircle size={16} className="mt-0.5 shrink-0" />
        : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

// ─── OTP digit input ──────────────────────────────────────────────────────
function OtpInput({
  value, onChange, error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const el = document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null;
      el?.focus();
    }
  };

  const handleChange = (i: number, ch: string) => {
    if (!/^\d*$/.test(ch)) return;
    const next = digits.map((d, idx) => (idx === i ? ch.slice(-1) : d)).join("");
    onChange(next);
    if (ch && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      el?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text);
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={ev => handleChange(i, ev.target.value)}
          onKeyDown={ev => handleKey(i, ev)}
          style={{
            width: 48,
            height: 56,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            borderRadius: 12,
            border: `2px solid ${d ? T.primary : error ? T.error : T.border}`,
            background: d ? T.infoBg : T.card,
            color: T.foreground,
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={e  => { e.currentTarget.style.borderColor = T.primary; }}
          onBlur={e   => { e.currentTarget.style.borderColor = d ? T.primary : error ? T.error : T.border; }}
        />
      ))}
    </div>
  );
}

// ─── View: Login ──────────────────────────────────────────────────────────
function LoginView({ onForgot }: { onForgot: () => void }) {
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGL]  = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    setServerError("");
    try {
      // Validate via our custom route first (for structured errors + rate limiting)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Error al iniciar sesión.");
        return;
      }
      // Delegate session creation to NextAuth
      const result = await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setServerError("Credenciales incorrectas. Verifica tu email y contraseña.");
      } else {
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGL(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <div className="text-center mb-7">
        <a href="/" className="inline-flex items-center gap-1.5 mb-4">
          <span className="text-2xl font-extrabold font-serif" style={{ color: T.primary }}>Nidoo</span>
        </a>
        <h1 className="text-2xl font-bold font-serif mb-1" style={{ color: T.foreground }}>
          Bienvenido/a de vuelta
        </h1>
        <p className="text-sm" style={{ color: T.muted }}>
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      {serverError && <AlertBanner type="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none"
              style={{ color: T.muted }}
            />
            <InputBase
              id="email"
              type="email"
              placeholder="tu@email.com"
              error={!!errors.email}
              style={{ paddingLeft: 38 }}
              {...register("email")}
            />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs font-semibold transition-colors"
              style={{ color: T.primary, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none"
              style={{ color: T.muted }}
            />
            <InputBase
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              error={!!errors.password}
              style={{ paddingLeft: 38, paddingRight: 42 }}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2"
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 0 }}
            >
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <PrimaryBtn type="submit" loading={loading}>
          Iniciar sesión
        </PrimaryBtn>
      </form>

      <Divider />

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 font-semibold text-sm transition-colors"
        style={{
          border: `1.5px solid ${T.border}`,
          borderRadius: 999,
          padding: "12px 24px",
          background: T.card,
          color: T.foreground,
          cursor: googleLoading ? "not-allowed" : "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.mutedBg; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.card; }}
      >
        {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon size={16} />}
        Continuar con Google
      </button>

      <p className="text-center text-sm mt-5" style={{ color: T.muted }}>
        ¿No tienes cuenta?{" "}
        <a href="/registro" className="font-semibold" style={{ color: T.primary }}>
          Regístrate gratis
        </a>
      </p>

      <p className="text-center text-xs mt-4 px-2 leading-relaxed" style={{ color: T.muted }}>
        Solo te contactaremos en casos importantes relacionados con tu cuenta.
      </p>
    </>
  );
}

// ─── View: Recover password ───────────────────────────────────────────────
function RecoverView({
  onBack,
  onOtpSent,
}: {
  onBack: () => void;
  onOtpSent: (email: string, demoOtp?: string) => void;
}) {
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RecoverData>({
    resolver: zodResolver(recoverSchema),
    mode: "onTouched",
  });

  const onSubmit = async ({ email }: RecoverData) => {
    setLoading(true);
    setServerError("");
    try {
      const res  = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Error al enviar el código.");
        return;
      }
      onOtpSent(email, json.demoOtp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackBtn onClick={onBack} />
      <div className="mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: `${T.primary}1A` }}
        >
          <Lock size={22} style={{ color: T.primary }} />
        </div>
        <h2 className="text-xl font-bold font-serif mb-1" style={{ color: T.foreground }}>
          Recuperar contraseña
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: T.muted }}>
          Ingresa tu email y te enviaremos un código de verificación de 6 dígitos.
        </p>
      </div>

      {serverError && <AlertBanner type="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <Label htmlFor="recover-email">Correo electrónico</Label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none"
              style={{ color: T.muted }}
            />
            <InputBase
              id="recover-email"
              type="email"
              placeholder="tu@email.com"
              error={!!errors.email}
              style={{ paddingLeft: 38 }}
              {...register("email")}
            />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <PrimaryBtn type="submit" loading={loading}>
          Enviar código de verificación
        </PrimaryBtn>
      </form>
    </>
  );
}

// ─── View: OTP verification ───────────────────────────────────────────────
function OtpView({
  email,
  demoOtp,
  onBack,
  onVerified,
}: {
  email: string;
  demoOtp?: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [otp, setOtp]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");
  const [resendCooldown, setCD]   = useState(0);

  const { handleSubmit, setValue, formState: { errors }, trigger } = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    mode: "onSubmit",
    defaultValues: { otp: "" },
  });

  const handleOtpChange = useCallback((v: string) => {
    setOtp(v);
    setValue("otp", v, { shouldValidate: false });
  }, [setValue]);

  const onSubmit = async () => {
    const valid = await trigger("otp");
    if (!valid) return;

    setLoading(true);
    setServerError("");
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Código inválido.");
        return;
      }
      onVerified();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setCD(60);
    const timer = setInterval(() => {
      setCD(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <>
      <BackBtn onClick={onBack} />
      <div className="mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: `${T.primary}1A` }}
        >
          <Mail size={22} style={{ color: T.primary }} />
        </div>
        <h2 className="text-xl font-bold font-serif mb-1" style={{ color: T.foreground }}>
          Verifica tu identidad
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: T.muted }}>
          Ingresa el código de 6 dígitos enviado a{" "}
          <span className="font-semibold" style={{ color: T.foreground }}>{email}</span>
        </p>
      </div>

      {/* Demo mode hint */}
      {demoOtp && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: T.infoBg, border: `1px solid ${T.border}`, color: T.muted }}
        >
          <span className="font-semibold" style={{ color: T.primary }}>Modo demo:</span> tu código es{" "}
          <span
            className="font-mono font-bold text-base cursor-pointer"
            style={{ color: T.primary }}
            onClick={() => handleOtpChange(demoOtp)}
          >
            {demoOtp}
          </span>{" "}
          (haz clic para llenarlo automáticamente)
        </div>
      )}

      {serverError && <AlertBanner type="error" message={serverError} />}

      <form onSubmit={e => { e.preventDefault(); onSubmit(); }} noValidate>
        <div className="mb-5">
          <OtpInput value={otp} onChange={handleOtpChange} error={!!errors.otp || !!serverError} />
          <FieldError message={errors.otp?.message} />
        </div>

        <PrimaryBtn type="submit" loading={loading} disabled={otp.length < 6}>
          Verificar código
        </PrimaryBtn>
      </form>

      <p className="text-center text-sm mt-4" style={{ color: T.muted }}>
        ¿No recibiste el código?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-semibold transition-colors"
          style={{
            color: resendCooldown > 0 ? T.muted : T.primary,
            background: "none",
            border: "none",
            cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
            padding: 0,
          }}
        >
          {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : "Reenviar"}
        </button>
      </p>
    </>
  );
}

// ─── View: Success ────────────────────────────────────────────────────────
function SuccessView() {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: T.successBg }}
      >
        <CheckCircle2 size={32} style={{ color: T.success }} />
      </div>
      <h2 className="text-xl font-bold font-serif mb-2" style={{ color: T.foreground }}>
        Identidad verificada
      </h2>
      <p className="text-sm leading-relaxed mb-7" style={{ color: T.muted }}>
        Tu identidad ha sido verificada correctamente. Ahora puedes crear una nueva
        contraseña desde tu perfil.
      </p>
      <PrimaryBtn onClick={() => { window.location.href = "/"; }}>
        Ir a mi perfil
      </PrimaryBtn>
      <a
        href="/login"
        className="block text-sm font-semibold mt-4 transition-colors"
        style={{ color: T.muted }}
      >
        Volver al inicio de sesión
      </a>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────
export default function LoginPage() {
  const [view, setView]       = useState<View>("login");
  const [recoverEmail, setRE] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | undefined>();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: T.bg }}
    >
      <Card>
        {view === "login" && (
          <LoginView onForgot={() => setView("recover")} />
        )}
        {view === "recover" && (
          <RecoverView
            onBack={() => setView("login")}
            onOtpSent={(email, demo) => {
              setRE(email);
              setDemoOtp(demo);
              setView("otp");
            }}
          />
        )}
        {view === "otp" && (
          <OtpView
            email={recoverEmail}
            demoOtp={demoOtp}
            onBack={() => setView("recover")}
            onVerified={() => setView("success")}
          />
        )}
        {view === "success" && <SuccessView />}
      </Card>

      <p className="text-xs text-center mt-6 max-w-xs leading-relaxed" style={{ color: T.muted }}>
        Tus datos están cifrados y protegidos. Nunca compartiremos tu información con terceros sin tu consentimiento.
      </p>
    </main>
  );
}
