"use client";

import React, { useState, useCallback } from "react";
import {
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle,
  RotateCcw, Clock, Loader2, Lock, Mail,
} from "lucide-react";
import CameraCapture from "@/components/onboarding/CameraCapture";
import { validateIdentity, type VerificationResult } from "@/lib/id-validation";

// ─── Design tokens — mirror app/onboarding/page.tsx TOKEN object ─────────────
const T = {
  primary:     "#D85A30",
  primaryHover:"#c04f28",
  bg:          "#fdf8f4",
  card:        "#ffffff",
  border:      "#e2cbb5",
  muted:       "#9e7a5a",
  mutedBg:     "#f0e4d7",
  foreground:  "#2c1a0e",
  secondary:   "#f5ede3",
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type { VerificationResult };

export interface IdentityStepProps {
  registeredName?: string;
  onNext: (result: VerificationResult) => void;
  onBack: () => void;
}

type CaptureSubStep = "front" | "back" | "selfie";
type SubStep = CaptureSubStep | "analyzing" | "result";

// ─── Sub-step progress dots (3 capture points only) ──────────────────────────
const CAPTURE_STEPS: CaptureSubStep[] = ["front", "back", "selfie"];
const CAPTURE_LABELS: Record<CaptureSubStep, string> = {
  front:  "Frente DUI",
  back:   "Reverso DUI",
  selfie: "Selfie",
};

function CaptureProgressBar({
  idFront,
  idBack,
  selfie,
  current,
}: {
  idFront: File | null;
  idBack:  File | null;
  selfie:  File | null;
  current: CaptureSubStep;
}) {
  const completed: Record<CaptureSubStep, boolean> = {
    front:  !!idFront,
    back:   !!idBack,
    selfie: !!selfie,
  };
  const currentIdx = CAPTURE_STEPS.indexOf(current);

  return (
    <div className="flex items-center w-full mb-5" aria-label="Progreso de capturas">
      {CAPTURE_STEPS.map((s, i) => {
        const done   = completed[s];
        const active = s === current;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: done
                    ? T.primary
                    : active
                    ? T.primary
                    : T.mutedBg,
                  color: done || active ? "#fff" : T.muted,
                  boxShadow: active ? `0 0 0 4px ${T.primary}33` : "none",
                }}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? T.primary : done ? T.foreground : T.muted, opacity: done ? 0.7 : 1 }}
              >
                {CAPTURE_LABELS[s]}
              </span>
            </div>
            {i < CAPTURE_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 rounded-full transition-colors duration-300"
                style={{ background: completed[CAPTURE_STEPS[i]] ? T.primary : T.mutedBg }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Photo counter ────────────────────────────────────────────────────────────
function PhotoCounter({ idFront, idBack, selfie }: { idFront: File | null; idBack: File | null; selfie: File | null }) {
  const count = [idFront, idBack, selfie].filter(Boolean).length;
  return (
    <p className="text-xs font-medium text-center" style={{ color: T.muted }}>
      {count} de 3 fotos completadas
    </p>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ label, passed, detail }: { label: string; passed: boolean | "warning"; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className="shrink-0 mt-0.5">
        {passed === true    && <CheckCircle2 size={16} className="text-green-500" />}
        {passed === false   && <XCircle      size={16} className="text-red-500"   />}
        {passed === "warning" && <AlertTriangle size={16} className="text-yellow-500" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: T.foreground }}>{label}</p>
        {detail && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: T.muted }}>{detail}</p>}
      </div>
    </div>
  );
}

// ─── Name mismatch dialog ────────────────────────────────────────────────────
function NameMismatchDialog({
  extractedName,
  onConfirm,
  onEdit,
}: {
  extractedName: string;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(44,26,14,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col gap-4" style={{ background: T.card, border: `1.5px solid ${T.border}` }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fef9c3" }}>
            <AlertTriangle size={20} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: T.foreground }}>Nombre encontrado en tu documento</h3>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: T.muted }}>
              Encontramos este nombre en tu documento:
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: T.foreground }}>{extractedName}</p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: T.muted }}>
              &iquest;Es correcto?
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{ border: `1.5px solid ${T.border}`, color: T.muted, background: T.bg }}
          >
            No, mantener el mio
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
            style={{ background: T.primary }}
          >
            Si, usar este nombre
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading messages ─────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  "Analizando tu documento...",
  "Verificando que no este vencido...",
  "Comparando con tu selfie...",
  "Finalizando verificacion...",
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function IdentityStep({ registeredName = "", onNext, onBack }: IdentityStepProps) {
  const [subStep,  setSubStep]  = useState<SubStep>("front");
  const [idFront,  setIdFront]  = useState<File | null>(null);
  const [idBack,   setIdBack]   = useState<File | null>(null);
  const [selfie,   setSelfie]   = useState<File | null>(null);
  const [result,   setResult]   = useState<VerificationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(0);

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingResult,  setPendingResult]  = useState<VerificationResult | null>(null);

  const isManualReview = attempts >= 2;

  // ── Capture handlers ─────────────────────────────────────────────────────
  const handleFront = useCallback((file: File) => {
    setIdFront(file);
    setSubStep("back");
  }, []);

  const handleBack = useCallback((file: File) => {
    setIdBack(file);
    setSubStep("selfie");
  }, []);

  const handleSelfie = useCallback(async (file: File) => {
    setSelfie(file);
    setSubStep("analyzing");
    setLoadingMsg(0);

    // Sequential loading messages: 0ms / 1500ms / 3000ms / 4500ms
    const t1 = setTimeout(() => setLoadingMsg(1), 1500);
    const t2 = setTimeout(() => setLoadingMsg(2), 3000);
    const t3 = setTimeout(() => setLoadingMsg(3), 4500);

    try {
      const res = await validateIdentity(idFront!, idBack!, file, registeredName);

      if (res.nameWarning && res.overallApproved) {
        setPendingResult(res);
        setShowNameDialog(true);
      } else {
        setResult(res);
      }
    } catch {
      setResult({
        idFrontFile:      idFront!,
        idBackFile:       idBack!,
        selfieFile:       file,
        extractedData:    { documentNumber: "", fullName: "", expiryDate: "", birthDate: "" },
        faceMatchScore:   0,
        livenessDetected: false,
        overallApproved:  false,
        failureReason:    "Error de conexion. Verifica tu internet e intenta de nuevo.",
      });
    } finally {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setSubStep("result");
    }
  }, [idFront, idBack, registeredName]);

  // ── Retry ─────────────────────────────────────────────────────────────────
  const retry = useCallback((focusStep: CaptureSubStep) => {
    setAttempts(n => n + 1);
    setResult(null);
    if (focusStep === "front") { setIdFront(null); setIdBack(null); setSelfie(null); }
    if (focusStep === "back")  { setIdBack(null);  setSelfie(null); }
    if (focusStep === "selfie") { setSelfie(null); }
    setSubStep(focusStep);
  }, []);

  // ── Manual review continue ────────────────────────────────────────────────
  const continueManualReview = useCallback(() => {
    onNext({
      idFrontFile:      idFront!,
      idBackFile:       idBack!,
      selfieFile:       selfie!,
      extractedData:    { documentNumber: "", fullName: "", expiryDate: "", birthDate: "" },
      faceMatchScore:   0,
      livenessDetected: false,
      overallApproved:  false,
      manualReview:     true,
    });
  }, [idFront, idBack, selfie, onNext]);

  // ── Name dialog handlers ──────────────────────────────────────────────────
  const handleNameConfirm = useCallback(() => {
    setShowNameDialog(false);
    if (pendingResult) setResult(pendingResult);
    setPendingResult(null);
  }, [pendingResult]);

  const handleNameEdit = useCallback(() => {
    setShowNameDialog(false);
    setPendingResult(null);
    onBack(); // Return to step 1 to fix registered name
  }, [onBack]);

  // ── Derive which capture step the failure came from ───────────────────────
  const failedStep: CaptureSubStep = (() => {
    if (!result) return "front";
    if (!result.extractedData.documentNumber) return "front";
    if (!result.livenessDetected || result.faceMatchScore < 85) return "selfie";
    return "front";
  })();

  // ─────────────────────────────────────────────────────────────────────────
  // Render: ANALYZING
  // ─────────────────────────────────────────────────────────────────────────
  if (subStep === "analyzing") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: `${T.primary}22` }}
        >
          <Loader2 size={28} style={{ color: T.primary }} className="animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold font-serif" style={{ color: T.foreground }}>
            Verificando tu identidad...
          </p>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: T.muted }}>
            Esto puede tardar unos segundos.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {LOADING_MESSAGES.map((msg, i) => {
            const isActive = i === loadingMsg;
            const isDone   = i < loadingMsg;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300"
                style={{
                  background: isActive ? T.secondary : "transparent",
                  opacity: isActive || isDone ? 1 : 0.35,
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={14} style={{ color: T.primary, flexShrink: 0 }} />
                ) : (
                  <Loader2
                    size={14}
                    style={{ color: isActive ? T.primary : T.muted, flexShrink: 0 }}
                    className={isActive ? "animate-spin" : ""}
                  />
                )}
                <span
                  className="text-sm font-medium"
                  style={{ color: isActive ? T.foreground : T.muted }}
                >
                  {msg}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: RESULT
  // ─────────────────────────────────────────────────────────────────────────
  if (subStep === "result" && result) {
    const { extractedData: ed, faceMatchScore, livenessDetected, overallApproved, failureReason, manualReview } = result;

    // Manual review fallback (after 2 failed attempts)
    if (manualReview) {
      return (
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#fef9c3" }}>
            <Clock size={26} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-base font-bold font-serif" style={{ color: T.foreground }}>Revision manual en proceso</p>
            <p className="text-sm mt-2 leading-relaxed max-w-sm mx-auto" style={{ color: T.muted }}>
              Enviaremos tus documentos a revision manual en menos de 24 horas. Puedes continuar el registro y publicar tu habitacion una vez que se apruebe.
            </p>
          </div>
          <button
            type="button"
            onClick={continueManualReview}
            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all"
            style={{ background: T.primary }}
          >
            Entendido, continuar
          </button>
        </div>
      );
    }

    const failureMessages: Record<string, string> = {
      "El documento esta vencido":        "Presenta un documento vigente para continuar.",
      "No pudimos leer el numero":        "Asegurate de que el documento este bien iluminado y sin obstrucciones.",
      "La selfie no coincide":            "La foto de tu cara no coincide con el documento. Intenta con mejor iluminacion.",
      "No pudimos confirmar que eres":    "Asegurate de mirar directamente a la camara, con buena luz y sin filtros.",
      "Debes ser mayor de 18":            "Solo puedes registrarte si eres mayor de edad.",
    };

    const friendlyReason = failureReason
      ? Object.entries(failureMessages).find(([key]) => failureReason.includes(key))?.[1] ?? failureReason
      : undefined;

    return (
      <>
        {showNameDialog && pendingResult && (
          <NameMismatchDialog
            extractedName={pendingResult.extractedData.fullName}
            onConfirm={handleNameConfirm}
            onEdit={handleNameEdit}
          />
        )}

        {/* Status badge */}
        <div
          className="flex items-center gap-3 rounded-xl p-4 mb-5"
          style={{ background: overallApproved ? "#f0fdf4" : "#fef2f2" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: overallApproved ? "#dcfce7" : "#fee2e2" }}
          >
            {overallApproved
              ? <ShieldCheck size={20} className="text-green-600" />
              : <XCircle    size={20} className="text-red-500"   />
            }
          </div>
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: overallApproved ? "#15803d" : "#dc2626" }}
            >
              {overallApproved ? "Identidad verificada" : "Verificacion fallida"}
            </p>
            {friendlyReason && (
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#dc2626" }}>
                {friendlyReason}
              </p>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="flex flex-col mb-5" style={{ borderTop: `1px solid ${T.border}` }}>
          <ResultRow
            label="Documento legible"
            passed={!!ed.documentNumber}
            detail={ed.documentNumber ? `Numero de DUI: ${ed.documentNumber}` : "No se pudo extraer el numero del documento"}
          />
          <ResultRow
            label="Documento vigente"
            passed={ed.expiryDate ? new Date(ed.expiryDate) >= new Date() : false}
            detail={ed.expiryDate ? `Vence: ${ed.expiryDate}` : undefined}
          />
          <ResultRow
            label="Mayor de 18 anos confirmado"
            passed={
              ed.birthDate
                ? (Date.now() - new Date(ed.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25) >= 18
                : false
            }
            detail={ed.birthDate ? `Fecha de nacimiento: ${ed.birthDate}` : undefined}
          />
          <ResultRow
            label="Nombre coincide con el registrado"
            passed={result.nameWarning ? "warning" : true}
            detail={ed.fullName ? `Nombre en documento: ${ed.fullName}` : undefined}
          />
          <ResultRow
            label={`Coincidencia facial: ${faceMatchScore.toFixed(1)}%`}
            passed={faceMatchScore >= 85}
            detail={
              faceMatchScore >= 85
                ? "Rostro verificado correctamente"
                : "La selfie no coincide con la foto del documento"
            }
          />
          <ResultRow
            label="Deteccion de vida confirmada"
            passed={livenessDetected}
            detail={livenessDetected ? undefined : "No pudimos confirmar que eres una persona real"}
          />
        </div>

        {/* Actions */}
        {overallApproved ? (
          <button
            type="button"
            onClick={() => onNext(result)}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all"
            style={{ background: T.primary }}
            onMouseEnter={e => (e.currentTarget.style.background = T.primaryHover)}
            onMouseLeave={e => (e.currentTarget.style.background = T.primary)}
          >
            Continuar
          </button>
        ) : isManualReview ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-center leading-relaxed" style={{ color: T.muted }}>
              Enviaremos tus documentos a revision manual en menos de 24 horas.
            </p>
            <button
              type="button"
              onClick={continueManualReview}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all"
              style={{ background: T.primary }}
            >
              Entendido, continuar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => retry(failedStep)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
                style={{ border: `1.5px solid ${T.border}`, color: T.muted, background: T.bg }}
              >
                <RotateCcw size={14} /> Reintentar
              </button>
              <a
                href={`mailto:soporte@nidoo.app?subject=Ayuda%20verificacion%20de%20identidad&body=Hola,%20necesito%20ayuda%20con%20la%20verificacion%20de%20identidad.`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
                style={{ border: `1.5px solid ${T.primary}`, color: T.primary, background: `${T.primary}0d` }}
              >
                <Mail size={14} /> Necesito ayuda
              </a>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: CAPTURE sub-steps (front / back / selfie)
  // ─────────────────────────────────────────────────────────────────────────
  const captureStep = subStep as CaptureSubStep;

  return (
    <>
      {/* Step header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${T.primary}22` }}
        >
          <ShieldCheck size={18} style={{ color: T.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif" style={{ color: T.foreground }}>
            Verificacion de identidad
          </h2>
          <p className="text-sm" style={{ color: T.muted }}>
            Requerida para garantizar la seguridad de todos.
          </p>
        </div>
      </div>

      {/* 3-dot progress */}
      <CaptureProgressBar
        idFront={idFront}
        idBack={idBack}
        selfie={selfie}
        current={captureStep}
      />

      {/* Sequential single camera capture */}
      {captureStep === "front" && (
        <CameraCapture
          mode="document"
          label="Frente del DUI / DNI / INE"
          sublabel="Mantén el documento horizontal y bien iluminado."
          onCapture={handleFront}
        />
      )}
      {captureStep === "back" && (
        <CameraCapture
          mode="document"
          label="Reverso del DUI / DNI / INE"
          sublabel="Muestra el reverso completo sin obstrucciones."
          onCapture={handleBack}
        />
      )}
      {captureStep === "selfie" && (
        <CameraCapture
          mode="selfie"
          label="Selfie de verificacion"
          sublabel="Mira directamente a la camara, sin filtros ni lentes de sol."
          onCapture={handleSelfie}
        />
      )}

      {/* Photo counter */}
      <div className="mt-3">
        <PhotoCounter idFront={idFront} idBack={idBack} selfie={selfie} />
      </div>

      {/* "Verificar identidad" button — visible only on selfie step, disabled until all 3 captured */}
      {captureStep === "selfie" && (
        <button
          type="button"
          disabled={!idFront || !idBack}
          className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: T.primary }}
          onClick={() => {
            /* selfie capture triggers analysis automatically via handleSelfie */
          }}
        >
          Captura tu selfie para verificar
        </button>
      )}

      {/* Encryption disclaimer */}
      <div
        className="flex items-start gap-3 rounded-2xl p-4 mt-4"
        style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe" }}
      >
        <Lock size={16} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: "#1d4ed8" }}>
          Tus documentos se cifran antes de enviarse. Solo se usan para verificar tu identidad y nunca se comparten con terceros.
        </p>
      </div>

      {/* Back navigation */}
      {captureStep === "front" && (
        <button
          type="button"
          onClick={onBack}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: T.muted }}
        >
          &#8592; Volver
        </button>
      )}
      {captureStep !== "front" && (
        <button
          type="button"
          onClick={() => {
            if (captureStep === "back")   setSubStep("front");
            if (captureStep === "selfie") setSubStep("back");
          }}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: T.muted }}
        >
          &#8592; Volver
        </button>
      )}
    </>
  );
}
