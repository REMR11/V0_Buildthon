"use client";

import React, { useState, useCallback } from "react";
import {
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle,
  RotateCcw, ChevronLeft, Loader2, Clock,
} from "lucide-react";
import { Card, StepNav } from "./primitives";
import CameraCapture from "./CameraCapture";
import { validateIdentity, type VerificationResult } from "@/lib/id-validation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type { VerificationResult };

export interface IdentityStepProps {
  role: "propietario" | "inquilino";
  registeredName?: string; // full name from step 1, used for cross-check
  onComplete: (result: VerificationResult) => void;
  onBack: () => void;
}

type SubStep = "front" | "back" | "selfie" | "result";

const SUB_STEPS: SubStep[] = ["front", "back", "selfie", "result"];

const SUB_STEP_LABELS: Record<SubStep, string> = {
  front: "Frente",
  back: "Reverso",
  selfie: "Selfie",
  result: "Resultado",
};

// ---------------------------------------------------------------------------
// Sub-step progress bar (4 dots + connecting lines)
// ---------------------------------------------------------------------------
function SubProgressBar({ current }: { current: SubStep }) {
  const currentIdx = SUB_STEPS.indexOf(current);
  return (
    <div className="flex items-center w-full mb-6" aria-label="Progreso de verificacion">
      {SUB_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted-bg text-muted"
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-primary" : done ? "text-foreground/60" : "text-muted"
                }`}
              >
                {SUB_STEP_LABELS[s]}
              </span>
            </div>
            {i < SUB_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 rounded-full transition-colors duration-300"
                style={{ background: done ? "var(--color-primary)" : "var(--color-muted-bg)" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual result row
// ---------------------------------------------------------------------------
interface ResultRowProps {
  label: string;
  passed: boolean | "warning";
  detail?: string;
}

function ResultRow({ label, passed, detail }: ResultRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="shrink-0 mt-0.5">
        {passed === true && <CheckCircle2 size={16} className="text-green-500" />}
        {passed === false && <XCircle size={16} className="text-red-500" />}
        {passed === "warning" && <AlertTriangle size={16} className="text-yellow-500" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        {detail && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{detail}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Name mismatch modal
// ---------------------------------------------------------------------------
interface NameModalProps {
  extractedName: string;
  onConfirm: () => void;
  onEdit: () => void;
}

function NameMismatchModal({ extractedName, onConfirm, onEdit }: NameModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Nombre detectado</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              El documento muestra el nombre:
            </p>
            <p className="text-sm font-semibold text-foreground mt-1">{extractedName}</p>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              &iquest;Es este tu nombre?
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground/70 hover:border-primary/50 transition-all"
          >
            No, editar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function IdentityVerificationStep({
  role,
  registeredName = "",
  onComplete,
  onBack,
}: IdentityStepProps) {
  const [subStep, setSubStep] = useState<SubStep>("front");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0-3 for the 4 sequential labels
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingResult, setPendingResult] = useState<VerificationResult | null>(null);

  // How many times analysis has already failed (for manual fallback)
  const isManualReview = retryCount >= 2;

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleFront = useCallback((file: File) => {
    setFrontFile(file);
    setSubStep("back");
  }, []);

  const handleBack = useCallback((file: File) => {
    setBackFile(file);
    setSubStep("selfie");
  }, []);

  const handleSelfie = useCallback(async (file: File) => {
    setSelfieFile(file);
    setSubStep("result");
    setAnalyzing(true);
    setLoadingStep(0);

    // Timed sequential loading labels (visual feedback per spec)
    const timers = [
      setTimeout(() => setLoadingStep(1), 1500),
      setTimeout(() => setLoadingStep(2), 2500),
      setTimeout(() => setLoadingStep(3), 3500),
    ];

    try {
      const res = await validateIdentity(frontFile!, backFile!, file, registeredName);

      // Name warning is now set server-side; check and show modal if needed
      if (res.nameWarning && res.overallApproved) {
        setPendingResult(res);
        setShowNameModal(true);
      } else {
        setResult(res);
      }
    } catch {
      setResult({
        idFrontFile: frontFile!,
        idBackFile: backFile!,
        selfieFile: file,
        extractedData: { documentNumber: "", fullName: "", expiryDate: "", birthDate: "" },
        faceMatchScore: 0,
        livenessDetected: false,
        overallApproved: false,
        failureReason: "Error de conexion. Por favor intenta de nuevo.",
      });
    } finally {
      timers.forEach(clearTimeout);
      setAnalyzing(false);
    }
  }, [frontFile, backFile, registeredName]);

  // ── Retry ─────────────────────────────────────────────────────────────────
  const retry = useCallback((failedSubStep: SubStep) => {
    setRetryCount((n) => n + 1);
    setResult(null);
    setSubStep(failedSubStep);
    if (failedSubStep === "front") setFrontFile(null);
    if (failedSubStep === "back") setBackFile(null);
    if (failedSubStep === "selfie" || failedSubStep === "front") setSelfieFile(null);
  }, []);

  // ── Manual review continue ────────────────────────────────────────────────
  const continueManualReview = useCallback(() => {
    if (!frontFile || !backFile || !selfieFile) return;
    onComplete({
      idFrontFile: frontFile,
      idBackFile: backFile,
      selfieFile,
      extractedData: { documentNumber: "", fullName: "", expiryDate: "", birthDate: "" },
      faceMatchScore: 0,
      livenessDetected: false,
      overallApproved: false,
      manualReview: true,
    });
  }, [frontFile, backFile, selfieFile, onComplete]);

  // ── Name modal handlers ───────────────────────────────────────────────────
  const handleNameConfirm = useCallback(() => {
    setShowNameModal(false);
    if (pendingResult) setResult(pendingResult);
    setPendingResult(null);
  }, [pendingResult]);

  const handleNameEdit = useCallback(() => {
    setShowNameModal(false);
    setPendingResult(null);
    onBack(); // Send user back to step 1 to fix their name
  }, [onBack]);

  // ── Derive which sub-step the rejection came from ─────────────────────────
  const failedSubStep: SubStep = (() => {
    if (!result) return "front";
    if (!result.extractedData.documentNumber) return "front";
    if (!result.livenessDetected || result.faceMatchScore < 85) return "selfie";
    return "front";
  })();

  // ---------------------------------------------------------------------------
  // Render — RESULT sub-step
  // ---------------------------------------------------------------------------
  if (subStep === "result") {
    const LOADING_LABELS = [
      "Analizando documento...",
      "Verificando datos...",
      "Comparando con tu selfie...",
      "Finalizando...",
    ];

    if (analyzing) {
      return (
        <Card>
          <SubProgressBar current="result" />
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">Verificando tu identidad...</p>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Esto puede tardar unos segundos.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {LOADING_LABELS.map((label, i) => {
                const isActive = i === loadingStep;
                const isDone   = i < loadingStep;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${
                      isActive ? "bg-secondary" : "opacity-40"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    ) : (
                      <Loader2
                        size={14}
                        className={`shrink-0 ${isActive ? "text-primary animate-spin" : "text-muted"}`}
                      />
                    )}
                    <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      );
    }

    if (result) {
      const {
        extractedData: ed,
        faceMatchScore,
        livenessDetected,
        overallApproved,
        failureReason,
        manualReview,
      } = result;

      if (manualReview) {
        return (
          <Card>
            <SubProgressBar current="result" />
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                <Clock size={26} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Revision manual en proceso</p>
                <p className="text-sm text-muted mt-2 leading-relaxed max-w-sm mx-auto">
                  Enviaremos tus documentos a revision manual. Te notificaremos en menos de 24 horas.
                </p>
              </div>
              <button
                type="button"
                onClick={continueManualReview}
                className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-all"
              >
                Continuar al siguiente paso
              </button>
            </div>
          </Card>
        );
      }

      return (
        <>
          {showNameModal && pendingResult && (
            <NameMismatchModal
              extractedName={pendingResult.extractedData.fullName}
              onConfirm={handleNameConfirm}
              onEdit={handleNameEdit}
            />
          )}
          <Card>
            <SubProgressBar current="result" />

            {/* Status badge */}
            <div className={`flex items-center gap-3 rounded-xl p-4 mb-5 ${overallApproved ? "bg-green-50" : "bg-red-50"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${overallApproved ? "bg-green-100" : "bg-red-100"}`}>
                {overallApproved
                  ? <ShieldCheck size={20} className="text-green-600" />
                  : <XCircle size={20} className="text-red-500" />}
              </div>
              <div>
                <p className={`text-sm font-bold ${overallApproved ? "text-green-700" : "text-red-600"}`}>
                  {overallApproved ? "Identidad verificada" : "Verificacion fallida"}
                </p>
                {failureReason && (
                  <p className="text-xs text-red-600/80 mt-0.5 leading-relaxed">{failureReason}</p>
                )}
              </div>
            </div>

            {/* Check list */}
            <div className="flex flex-col mb-5">
              <ResultRow
                label="Documento legible"
                passed={!!ed.documentNumber}
                detail={ed.documentNumber ? `Numero: ${ed.documentNumber}` : "No se pudo extraer el numero"}
              />
              <ResultRow
                label="Documento no vencido"
                passed={ed.expiryDate ? new Date(ed.expiryDate) >= new Date() : false}
                detail={ed.expiryDate ? `Vence: ${ed.expiryDate}` : undefined}
              />
              <ResultRow
                label="Mayor de edad confirmado"
                passed={
                  ed.birthDate
                    ? (Date.now() - new Date(ed.birthDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25) >= 18
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
                detail={faceMatchScore >= 85 ? "Rostro verificado correctamente" : "La selfie no coincide con la foto del documento"}
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
                onClick={() => onComplete(result)}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-all"
              >
                Continuar al siguiente paso
              </button>
            ) : isManualReview ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-center text-muted leading-relaxed">
                  La verificacion automatica ha fallado 2 veces. Enviaremos tus documentos a revision manual.
                </p>
                <button
                  type="button"
                  onClick={continueManualReview}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-all"
                >
                  Continuar con revision manual
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => retry(failedSubStep)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground/70 hover:border-primary/50 transition-all"
                >
                  <RotateCcw size={14} /> Reintentar
                </button>
                <button
                  type="button"
                  onClick={() => retry("front")}
                  className="flex-1 rounded-xl bg-secondary py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-all"
                >
                  Subir fotos manualmente
                </button>
              </div>
            )}
          </Card>
        </>
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Render — CAPTURE sub-steps
  // ---------------------------------------------------------------------------
  const currentIndex = SUB_STEPS.indexOf(subStep);

  const headings: Record<SubStep, { title: string; hint: string }> = {
    front: {
      title: "Frente del documento",
      hint: "Asegurate de que sea horizontal, bien iluminado y sin obstrucciones.",
    },
    back: {
      title: "Reverso del documento",
      hint: "Muestra el reverso completo con el mismo cuidado.",
    },
    selfie:
      role === "propietario"
        ? {
            title: "Selfie de verificacion",
            hint: "Mira directamente a la camara con buena iluminacion. Sin filtros ni lentes.",
          }
        : {
            title: "Tu selfie con el documento",
            hint: "Sostien el documento junto a tu cara, con buena luz y sin filtros.",
          },
    result: { title: "", hint: "" },
  };

  const { title, hint } = headings[subStep];

  return (
    <Card>
      <SubProgressBar current={subStep} />

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted leading-relaxed">{hint}</p>
          </div>
        </div>

        {/* Camera capture */}
        {subStep === "front" && (
          <CameraCapture
            mode="document"
            label="Frente del documento de identidad"
            sublabel="Mantén el documento horizontal y bien iluminado."
            onCapture={handleFront}
          />
        )}
        {subStep === "back" && (
          <CameraCapture
            mode="document"
            label="Reverso del documento de identidad"
            sublabel="Muestra el reverso completo sin obstrucciones."
            onCapture={handleBack}
          />
        )}
        {subStep === "selfie" && (
          <CameraCapture
            mode="selfie"
            label={
              role === "propietario"
                ? "Selfie de verificacion"
                : "Selfie sosteniendo tu documento"
            }
            sublabel={
              role === "propietario"
                ? "Mira directamente a la camara, sin filtros ni lentes."
                : "Sostén el documento junto a tu cara con buena iluminación."
            }
            onCapture={handleSelfie}
          />
        )}

        {/* Back navigation (only on first sub-step) */}
        {currentIndex === 0 && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 self-start text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} /> Volver
          </button>
        )}
        {currentIndex > 0 && subStep !== "result" && (
          <button
            type="button"
            onClick={() => setSubStep(SUB_STEPS[currentIndex - 1])}
            className="flex items-center gap-1.5 self-start text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} /> Volver
          </button>
        )}
      </div>
    </Card>
  );
}


