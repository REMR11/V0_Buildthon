"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, Lock, Mail, ArrowLeft,
  Loader2, CheckCircle2, AlertCircle,
  MessageSquare, Home, Search,
} from "lucide-react";

// ─── Google "G" icon ─────────────────────────────────────────────────────────
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "login" | "recover" | "otp" | "welcome";
type Role   = "propietario" | "inquilino";
type Method = "email" | "sms";

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS: Record<Role, { primary: string; primaryHov: string; light: string }> = {
  propietario: { primary: "#D85A30", primaryHov: "#BF4D26", light: "#FEF3EE" },
  inquilino:   { primary: "#1D9E75", primaryHov: "#17856200", light: "#E8F7F2" },
};

// Static neutrals
const N = {
  bg:         "#FDF8F4",
  card:       "#FFFFFF",
  foreground: "#2C1A0E",
  muted:      "#8C7B6E",
  mutedBg:    "#F5EDE6",
  border:     "#E8D5C4",
  success:    "#2D8A4E",
  successBg:  "#EBF7EF",
  error:      "#C0392B",
  errorBg:    "#FDEDEB",
  infoBg:     "#FEF3EE",
};

// ─── Zod schemas ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
const recoverEmailSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});
const recoverSmsSchema = z.object({
  phone: z.string().min(8, "Ingresa un número válido"),
});
const otpSchema = z.object({
  otp: z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d{6}$/, "Solo números"),
});

type LoginData        = z.infer<typeof loginSchema>;
type RecoverEmailData = z.infer<typeof recoverEmailSchema>;
type RecoverSmsData   = z.infer<typeof recoverSmsSchema>;
type OtpData          = z.infer<typeof otpSchema>;

// ─── Primitives ───────────────────────────────────────────────────────────────
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold mb-1.5" style={{ color: N.foreground }}>
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs font-medium" style={{ color: N.error }}>
      <AlertCircle size={12} /> {message}
    </p>
  );
}

function InputBase({
  id, type = "text", placeholder, error,
  onFocus: externalFocus, onBlur: externalBlur,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const primary = "#D85A30";
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      style={{
        border: `1.5px solid ${error ? N.error : N.border}`,
        borderRadius: 12,
        background: N.card,
        color: N.foreground,
        outline: "none",
        width: "100%",
        padding: "11px 14px",
        fontSize: 15,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = error ? N.error : primary;
        e.currentTarget.style.boxShadow  = `0 0 0 3px ${primary}22`;
        externalFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? N.error : N.border;
        e.currentTarget.style.boxShadow  = "none";
        externalBlur?.(e);
      }}
      {...rest}
    />
  );
}

function PrimaryBtn({
  children, loading, disabled, type = "button", onClick, color,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;
  // Darken by ~15% on hover
  const hoverColor = color + "DD";
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDisabled ? `${color}70` : hovered ? hoverColor : color,
        color: "#FFFFFF",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 15,
        padding: "13px 24px",
        width: "100%",
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
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
      style={{
        background: N.card,
        borderRadius: 24,
        border: `1.5px solid ${N.border}`,
        boxShadow: "0 4px 40px 0 rgba(44,26,14,0.10)",
        padding: "36px 32px",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-1.5 text-sm font-semibold mb-5"
      style={{ color: hov ? "#D85A30" : N.muted, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
    >
      <ArrowLeft size={15} /> Volver
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <hr style={{ flex: 1, border: "none", borderTop: `1px solid ${N.border}` }} />
      <span className="text-xs font-medium" style={{ color: N.muted }}>o continúa con</span>
      <hr style={{ flex: 1, border: "none", borderTop: `1px solid ${N.border}` }} />
    </div>
  );
}

function AlertBanner({ type, message }: { type: "error" | "success" | "warning"; message: string }) {
  const colors = {
    error:   { bg: N.errorBg,   text: N.error,   icon: <AlertCircle size={16} className="mt-0.5 shrink-0" /> },
    success: { bg: N.successBg, text: N.success,  icon: <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> },
    warning: { bg: "#FFF8E6",   text: "#92600A",  icon: <AlertCircle size={16} className="mt-0.5 shrink-0" /> },
  };
  const c = colors[type];
  return (
    <div
      className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-medium"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.text}44` }}
    >
      {c.icon}
      <span>{message}</span>
    </div>
  );
}

// ─── Role segmented control ───────────────────────────────────────────────────
function RoleControl({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div
      className="flex rounded-full p-1 mb-6"
      style={{ background: N.mutedBg, border: `1px solid ${N.border}` }}
      role="group"
      aria-label="Tipo de usuario"
    >
      {(["propietario", "inquilino"] as Role[]).map(r => {
        const active = role === r;
        const c = COLORS[r];
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
              background: active ? c.primary : "transparent",
              color: active ? "#FFFFFF" : N.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            aria-pressed={active}
          >
            {r === "propietario" ? <Home size={13} /> : <Search size={13} />}
            {r === "propietario" ? "Propietario/a" : "Inquilino/a"}
          </button>
        );
      })}
    </div>
  );
}

// ─── Method segmented control (SMS / Correo) ──────────────────────────────────
function MethodControl({ method, onChange }: { method: Method; onChange: (m: Method) => void }) {
  return (
    <div
      className="flex rounded-full p-1 mb-5"
      style={{ background: N.mutedBg, border: `1px solid ${N.border}` }}
      role="group"
      aria-label="Método de recuperación"
    >
      {(["email", "sms"] as Method[]).map(m => {
        const active = method === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
              background: active ? "#D85A30" : "transparent",
              color: active ? "#FFFFFF" : N.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            aria-pressed={active}
          >
            {m === "sms" ? <MessageSquare size={13} /> : <Mail size={13} />}
            {m === "sms" ? "SMS" : "Correo"}
          </button>
        );
      })}
    </div>
  );
}

// ─── OTP digit input ──────────────────────────────────────────────────────────
function OtpInput({ value, onChange, error, color }: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  color: string;
}) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleChange = (i: number, ch: string) => {
    if (!/^\d*$/.test(ch)) return;
    const next = digits.map((d, idx) => (idx === i ? ch.slice(-1) : d)).join("");
    onChange(next);
    if (ch && i < 5) {
      (document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null)?.focus();
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      (document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text);
    e.preventDefault();
    // Focus last filled or next empty
    const focusIdx = Math.min(text.length, 5);
    (document.getElementById(`otp-${focusIdx}`) as HTMLInputElement | null)?.focus();
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
            width: 48, height: 56,
            textAlign: "center",
            fontSize: 22, fontWeight: 700,
            borderRadius: 12,
            border: `2px solid ${d ? color : error ? N.error : N.border}`,
            background: d ? N.infoBg : N.card,
            color: N.foreground,
            outline: "none",
            transition: "border-color 0.15s",
            flex: 1,
          }}
          onFocus={e  => { e.currentTarget.style.borderColor = color; }}
          onBlur={e   => { e.currentTarget.style.borderColor = d ? color : error ? N.error : N.border; }}
        />
      ))}
    </div>
  );
}

// ─── View: Login ──────────────────────────────────────────────────────────────
function LoginView({
  role, onRoleChange, onForgot,
}: {
  role: Role;
  onRoleChange: (r: Role) => void;
  onForgot: () => void;
}) {
  const c = COLORS[role];
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGL]        = useState(false);
  const [serverError, setServerError] = useState("");
  const [attempts, setAttempts]       = useState(0);
  const LOCK_AT = 5;
  const locked  = attempts >= LOCK_AT;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginData) => {
    if (locked) return;
    setLoading(true);
    setServerError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= LOCK_AT) {
          setServerError("Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente. Intenta de nuevo en 15 minutos.");
        } else {
          setServerError(json.error ?? `Credenciales incorrectas. Intento ${next} de ${LOCK_AT}.`);
        }
        return;
      }
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGL(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setServerError("Google OAuth no está configurado en este entorno.");
      setGL(false);
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-5">
        <a href="/" className="inline-block mb-3">
          <span className="text-2xl font-extrabold font-serif" style={{ color: c.primary }}>Nidoo</span>
        </a>
        <h1 className="text-xl font-bold font-serif mb-1" style={{ color: N.foreground }}>
          Bienvenido/a de vuelta
        </h1>
        <p className="text-sm" style={{ color: N.muted }}>
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      {/* Role selector */}
      <RoleControl role={role} onChange={onRoleChange} />

      {/* Demo hint */}
      <div
        className="rounded-xl px-4 py-3 mb-4 text-xs leading-relaxed"
        style={{ background: c.light, border: `1px solid ${N.border}`, color: N.muted }}
      >
        <span className="font-semibold" style={{ color: N.foreground }}>Modo demo:</span>{" "}
        usa <span className="font-mono font-semibold">demo@nidoo.com</span> / <span className="font-mono font-semibold">password123</span>
      </div>

      {/* Lockout or server error */}
      {locked && (
        <AlertBanner
          type="warning"
          message="Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta de nuevo en 15 minutos."
        />
      )}
      {!locked && serverError && <AlertBanner type="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" style={{ color: N.muted }} />
            <InputBase
              id="email"
              type="email"
              placeholder="tu@email.com"
              error={!!errors.email}
              style={{ paddingLeft: 38 }}
              disabled={locked}
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
              style={{ color: c.primary, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" style={{ color: N.muted }} />
            <InputBase
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              error={!!errors.password}
              style={{ paddingLeft: 38, paddingRight: 42 }}
              disabled={locked}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2"
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{ background: "none", border: "none", cursor: "pointer", color: N.muted, padding: 0 }}
            >
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <PrimaryBtn type="submit" loading={loading} disabled={locked} color={c.primary}>
          Iniciar sesión
        </PrimaryBtn>
      </form>

      <Divider />

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 font-semibold text-sm"
        style={{
          border: `1.5px solid ${N.border}`,
          borderRadius: 999,
          padding: "12px 24px",
          background: N.card,
          color: N.foreground,
          cursor: googleLoading ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = N.mutedBg; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = N.card; }}
      >
        {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon size={16} />}
        Continuar con Google
      </button>

      <p className="text-center text-sm mt-5" style={{ color: N.muted }}>
        ¿No tienes cuenta?{" "}
        <a href="/registro" className="font-semibold" style={{ color: c.primary }}>
          Regístrate gratis
        </a>
      </p>
      <p className="text-center text-xs mt-3 leading-relaxed" style={{ color: N.muted }}>
        Solo te contactaremos en casos importantes relacionados con tu cuenta.
      </p>
    </>
  );
}

// ─── View: Recover ────────────────────────────────────────────────────────────
function RecoverView({
  onBack,
  onOtpSent,
}: {
  onBack: () => void;
  onOtpSent: (contact: string, demoOtp?: string) => void;
}) {
  const [method, setMethod]           = useState<Method>("email");
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");

  const emailForm = useForm<RecoverEmailData>({ resolver: zodResolver(recoverEmailSchema), mode: "onTouched" });
  const smsForm   = useForm<RecoverSmsData>({ resolver: zodResolver(recoverSmsSchema), mode: "onTouched" });

  const onSubmitEmail = async ({ email }: RecoverEmailData) => {
    setLoading(true); setServerError("");
    try {
      const res  = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Error al enviar el código."); return; }
      onOtpSent(email, json.demoOtp);
    } finally { setLoading(false); }
  };

  const onSubmitSms = async ({ phone }: RecoverSmsData) => {
    setLoading(true); setServerError("");
    try {
      // SMS sending is mocked — use same endpoint
      const res  = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `${phone}@sms.nidoo.com` }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Error al enviar el código."); return; }
      onOtpSent(phone, json.demoOtp);
    } finally { setLoading(false); }
  };

  return (
    <>
      <BackBtn onClick={onBack} />
      <div className="mb-5">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: `${N.error}18` }}>
          <Lock size={22} style={{ color: "#D85A30" }} />
        </div>
        <h2 className="text-xl font-bold font-serif mb-1" style={{ color: N.foreground }}>
          Recuperar acceso
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: N.muted }}>
          Elige cómo quieres recibir tu código de verificación.
        </p>
      </div>

      <MethodControl method={method} onChange={(m) => { setMethod(m); setServerError(""); }} />

      {serverError && <AlertBanner type="error" message={serverError} />}

      {method === "email" ? (
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} noValidate className="flex flex-col gap-4">
          <div>
            <Label htmlFor="recover-email">Correo electrónico</Label>
            <div className="relative">
              <Mail size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" style={{ color: N.muted }} />
              <InputBase
                id="recover-email"
                type="email"
                placeholder="tu@email.com"
                error={!!emailForm.formState.errors.email}
                style={{ paddingLeft: 38 }}
                {...emailForm.register("email")}
              />
            </div>
            <FieldError message={emailForm.formState.errors.email?.message} />
          </div>
          <PrimaryBtn type="submit" loading={loading} color="#D85A30">
            Enviar código por correo
          </PrimaryBtn>
        </form>
      ) : (
        <form onSubmit={smsForm.handleSubmit(onSubmitSms)} noValidate className="flex flex-col gap-4">
          <div>
            <Label htmlFor="recover-phone">Número de teléfono</Label>
            <div className="relative">
              <MessageSquare size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" style={{ color: N.muted }} />
              <InputBase
                id="recover-phone"
                type="tel"
                placeholder="+503 7000 0000"
                error={!!smsForm.formState.errors.phone}
                style={{ paddingLeft: 38 }}
                {...smsForm.register("phone")}
              />
            </div>
            <FieldError message={smsForm.formState.errors.phone?.message} />
          </div>
          <PrimaryBtn type="submit" loading={loading} color="#D85A30">
            Enviar código por SMS
          </PrimaryBtn>
        </form>
      )}
    </>
  );
}

// ─── View: OTP ────────────────────────────────────────────────────────────────
function OtpView({
  contact, demoOtp, onBack, onVerified, color,
}: {
  contact: string;
  demoOtp?: string;
  onBack: () => void;
  onVerified: () => void;
  color: string;
}) {
  const [otp, setOtp]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");
  const [countdown, setCountdown] = useState(45);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

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
    setLoading(true); setServerError("");
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contact, otp }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Código inválido o expirado."); return; }
      onVerified();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: contact }),
    });
    setCountdown(45);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <>
      <BackBtn onClick={onBack} />
      <div className="mb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: `${color}1A` }}>
          <Mail size={22} style={{ color }} />
        </div>
        <h2 className="text-xl font-bold font-serif mb-1" style={{ color: N.foreground }}>
          Verifica tu identidad
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: N.muted }}>
          Ingresa el código de 6 dígitos enviado a{" "}
          <span className="font-semibold" style={{ color: N.foreground }}>{contact}</span>
        </p>
      </div>

      {demoOtp && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: N.infoBg, border: `1px solid ${N.border}`, color: N.muted }}
        >
          <span className="font-semibold" style={{ color }}>Modo demo:</span> código{" "}
          <span
            className="font-mono font-bold text-base cursor-pointer"
            style={{ color }}
            onClick={() => handleOtpChange(demoOtp)}
          >
            {demoOtp}
          </span>{" "}
          — haz clic para llenarlo automáticamente.
        </div>
      )}

      {serverError && <AlertBanner type="error" message={serverError} />}

      <form onSubmit={e => { e.preventDefault(); onSubmit(); }} noValidate>
        <div className="mb-5">
          <OtpInput value={otp} onChange={handleOtpChange} error={!!errors.otp || !!serverError} color={color} />
          <FieldError message={errors.otp?.message} />
        </div>
        <PrimaryBtn type="submit" loading={loading} disabled={otp.length < 6} color={color}>
          Verificar código
        </PrimaryBtn>
      </form>

      <p className="text-center text-sm mt-4" style={{ color: N.muted }}>
        ¿No recibiste el código?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0}
          style={{
            color: countdown > 0 ? N.muted : color,
            background: "none", border: "none",
            cursor: countdown > 0 ? "not-allowed" : "pointer",
            fontWeight: 600, padding: 0,
          }}
        >
          {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código"}
        </button>
      </p>
    </>
  );
}

// ─── View: Welcome ────────────────────────────────────────────────────────────
function WelcomeView({ role }: { role: Role }) {
  const router = useRouter();
  const c      = COLORS[role];
  const initials  = role === "propietario" ? "PR" : "IN";
  const roleLabel = role === "propietario" ? "Propietario/a" : "Inquilino/a";
  const now       = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4"
        style={{ background: c.light, color: c.primary, border: `3px solid ${c.primary}44` }}
      >
        {initials}
      </div>

      <h2 className="text-xl font-bold font-serif mb-1" style={{ color: N.foreground }}>
        ¡Bienvenido/a de vuelta!
      </h2>
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 mb-5"
        style={{ background: c.light, color: c.primary }}
      >
        <CheckCircle2 size={12} /> {roleLabel} · Verificado/a
      </span>

      {/* Info mini-card */}
      <div
        className="w-full rounded-2xl text-left mb-6"
        style={{ background: N.mutedBg, border: `1px solid ${N.border}`, padding: "16px 20px" }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: N.muted }}>Ultimo acceso</span>
            <span className="font-semibold" style={{ color: N.foreground }}>{now}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: N.muted }}>Estado del perfil</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5"
              style={{ background: N.successBg, color: N.success }}
            >
              <CheckCircle2 size={11} /> Verificado
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: N.muted }}>
              {role === "propietario" ? "Publicaciones activas" : "Solicitudes activas"}
            </span>
            <span className="font-semibold" style={{ color: N.foreground }}>2</span>
          </div>
        </div>
      </div>

      <PrimaryBtn
        color={c.primary}
        onClick={() => router.push(`/dashboard/${role}`)}
      >
        Ir a mi panel &rarr;
      </PrimaryBtn>

      <a
        href="/login"
        className="block text-sm font-semibold mt-4"
        style={{ color: N.muted }}
      >
        Cerrar sesión
      </a>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [screen, setScreen]   = useState<Screen>("login");
  const [role, setRole]       = useState<Role>("propietario");
  const [contact, setContact] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | undefined>();

  const color = COLORS[role].primary;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: N.bg }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Card>
          {screen === "login" && (
            <LoginView
              role={role}
              onRoleChange={setRole}
              onForgot={() => setScreen("recover")}
            />
          )}
          {screen === "recover" && (
            <RecoverView
              onBack={() => setScreen("login")}
              onOtpSent={(c, demo) => {
                setContact(c);
                setDemoOtp(demo);
                setScreen("otp");
              }}
            />
          )}
          {screen === "otp" && (
            <OtpView
              contact={contact}
              demoOtp={demoOtp}
              onBack={() => setScreen("recover")}
              onVerified={() => setScreen("welcome")}
              color={color}
            />
          )}
          {screen === "welcome" && <WelcomeView role={role} />}
        </Card>

        <p className="text-xs text-center mt-5 leading-relaxed px-4" style={{ color: N.muted }}>
          Tus datos están cifrados y protegidos. Nunca compartiremos tu información sin tu consentimiento.
        </p>
      </div>
    </main>
  );
}
