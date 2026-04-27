"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera, Upload, RefreshCw, Check,
  Sun, Focus, Crop, AlertTriangle, X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CameraCaptureProps {
  mode: "document" | "selfie";
  onCapture: (file: File) => void;
  onUploadFallback: (file: File) => void;
  guideOverlay?: React.ReactNode;
  label?: string;
}

type CameraPhase = "idle" | "streaming" | "captured" | "error";

interface QualityChecks {
  brightness: "good" | "warn" | "bad" | null;
  focus: "good" | "bad" | null;
  framing: "good" | "bad" | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fileFromCanvas(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("No blob")); return; }
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });
}

function analyzeBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const step = 8;
  const data = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  let count = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      // Perceived luminance
      sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      count++;
    }
  }
  return count > 0 ? sum / count : 0; // 0–255
}

function analyzeFocus(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  // Laplacian-like edge variance on a small central crop
  const cw = Math.floor(w / 2);
  const ch = Math.floor(h / 2);
  const cx = Math.floor(w / 4);
  const cy = Math.floor(h / 4);
  const data = ctx.getImageData(cx, cy, cw, ch).data;
  let sum = 0;
  let sum2 = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += gray;
    sum2 += gray * gray;
    count++;
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return sum2 / count - mean * mean; // variance
}

// ---------------------------------------------------------------------------
// Indicator dot
// ---------------------------------------------------------------------------
function QualityDot({
  status, label,
}: { status: "good" | "warn" | "bad" | null; label: string }) {
  if (status === null) return null;
  const color =
    status === "good" ? "bg-green-400" :
    status === "warn" ? "bg-yellow-400" :
    "bg-red-400";
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-white drop-shadow">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Corner guide for document mode
// ---------------------------------------------------------------------------
function DocumentGuide() {
  const corner = "absolute w-6 h-6 border-[3px] border-[#D85A30]";
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <span className={`${corner} top-4 left-4 border-r-0 border-b-0 rounded-tl-sm`} />
      <span className={`${corner} top-4 right-4 border-l-0 border-b-0 rounded-tr-sm`} />
      <span className={`${corner} bottom-4 left-4 border-r-0 border-t-0 rounded-bl-sm`} />
      <span className={`${corner} bottom-4 right-4 border-l-0 border-t-0 rounded-br-sm`} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Oval guide for selfie mode
// ---------------------------------------------------------------------------
function SelfieGuide() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
      <div
        className="border-[3px] border-[#D85A30] rounded-full"
        style={{ width: "55%", height: "80%", opacity: 0.85 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CameraCapture({
  mode,
  onCapture,
  onUploadFallback,
  label,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvas = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<CameraPhase>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string>("");
  const [quality, setQuality] = useState<QualityChecks>({ brightness: null, focus: null, framing: null });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Stop stream helper ────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (analysisTimer.current) {
      clearInterval(analysisTimer.current);
      analysisTimer.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  // ── Live quality analysis ─────────────────────────────────────────────────
  const runAnalysis = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = (analysisCanvas.current ??= document.createElement("canvas"));
    const w = video.videoWidth || 320;
    const h = video.videoHeight || 240;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    const brightness = analyzeBrightness(ctx, w, h);
    const focusVar = analyzeFocus(ctx, w, h);
    const isLandscape = w > h;

    setQuality({
      brightness:
        brightness > 80 ? "good" :
        brightness >= 50 ? "warn" : "bad",
      focus: focusVar > 100 ? "good" : "bad",
      framing:
        mode === "document"
          ? isLandscape ? "good" : "bad"
          : !isLandscape ? "good" : "bad",
    });
  }, [mode]);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode === "selfie" ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPhase("streaming");
      analysisTimer.current = setInterval(runAnalysis, 500);
    } catch {
      stopStream();
      setErrorMsg(
        "No pudimos acceder a la cámara. Revisa los permisos o sube el archivo manualmente."
      );
      setPhase("error");
      // Auto-open file picker as fallback
      setTimeout(() => fileInputRef.current?.click(), 400);
    }
  }, [mode, runAnalysis, stopStream]);

  // ── Capture frame ─────────────────────────────────────────────────────────
  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = (offscreenCanvas.current ??= document.createElement("canvas"));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    stopStream();
    const timestamp = Date.now();
    const name = `${mode}_${timestamp}.jpg`;
    try {
      const file = await fileFromCanvas(canvas, name);
      const preview = URL.createObjectURL(file);
      setCapturedFile(file);
      setCapturedPreview(preview);
      setPhase("captured");
    } catch {
      setErrorMsg("No pudimos guardar la foto. Intenta de nuevo.");
      setPhase("idle");
    }
  }, [mode, stopStream]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedFile(null);
    setCapturedPreview("");
    setQuality({ brightness: null, focus: null, framing: null });
    setPhase("idle");
  }, [capturedPreview]);

  // ── Use captured ──────────────────────────────────────────────────────────
  const useCapture = useCallback(() => {
    if (capturedFile) onCapture(capturedFile);
  }, [capturedFile, onCapture]);

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        stopStream();
        setPhase("idle");
        onUploadFallback(file);
      }
      e.target.value = "";
    },
    [onUploadFallback, stopStream],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-3">
      {/* Privacy notice */}
      <p className="text-[11px] text-muted text-center leading-relaxed">
        Tus datos están cifrados y solo se usan para verificar tu identidad.
      </p>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={mode === "selfie" ? "user" : "environment"}
        className="sr-only"
        aria-label={`Subir archivo de ${label ?? mode}`}
        onChange={handleFileChange}
      />

      {/* Main capture box */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted-bg"
        style={{ aspectRatio: mode === "document" ? "16/9" : "3/4" }}
      >
        {/* IDLE state */}
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <Camera size={26} className="text-primary" />
            </div>
            {label && (
              <p className="text-sm font-semibold text-foreground/80 text-center text-balance">
                {label}
              </p>
            )}
            <div className="flex gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground/70 hover:border-primary/50 hover:text-primary transition-all"
              >
                <Upload size={15} /> Subir archivo
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-all"
              >
                <Camera size={15} /> Tomar foto
              </button>
            </div>
          </div>
        )}

        {/* ERROR state */}
        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertTriangle size={22} className="text-orange-500" />
            </div>
            <p className="text-xs text-center text-foreground/70 leading-relaxed max-w-xs">
              {errorMsg}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setPhase("idle"); setErrorMsg(""); }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground/70 hover:border-primary/50 transition-all"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all"
              >
                Subir archivo
              </button>
            </div>
          </div>
        )}

        {/* STREAMING state */}
        {phase === "streaming" && (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: mode === "selfie" ? "scaleX(-1)" : "none" }}
            />

            {/* Guide overlay */}
            {mode === "document" ? <DocumentGuide /> : <SelfieGuide />}

            {/* Quality indicators */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <QualityDot
                status={quality.brightness}
                label={
                  quality.brightness === "good" ? "Buena luz" :
                  quality.brightness === "warn" ? "Poca luz" : "Muy oscuro"
                }
              />
              <QualityDot
                status={quality.focus}
                label={quality.focus === "good" ? "Enfocado" : "Desenfocado"}
              />
              <QualityDot
                status={quality.framing}
                label={
                  mode === "document"
                    ? quality.framing === "good" ? "Horizontal OK" : "Gira horizontal"
                    : quality.framing === "good" ? "Encuadre OK" : "Gira vertical"
                }
              />
            </div>

            {/* Cancel & capture */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 z-10">
              <button
                type="button"
                onClick={() => { stopStream(); setPhase("idle"); setQuality({ brightness: null, focus: null, framing: null }); }}
                className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
                aria-label="Cancelar"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={captureFrame}
                className="w-16 h-16 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center hover:scale-105 transition-all active:scale-95"
                aria-label="Capturar foto"
              >
                <Camera size={22} className="text-primary" />
              </button>
              <div className="w-10 h-10" aria-hidden /> {/* spacer */}
            </div>
          </>
        )}

        {/* CAPTURED state */}
        {phase === "captured" && capturedPreview && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedPreview}
              alt="Foto capturada"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: mode === "selfie" ? "scaleX(-1)" : "none" }}
            />
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 rounded-xl bg-black/60 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/80 transition-all"
              >
                <RefreshCw size={15} /> Repetir
              </button>
              <button
                type="button"
                onClick={useCapture}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-all"
              >
                <Check size={15} /> Usar esta foto
              </button>
            </div>
          </>
        )}
      </div>

      {/* Quality legend (streaming only) */}
      {phase === "streaming" && (
        <div className="flex items-center gap-3 justify-center text-[10px] text-muted">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Bueno</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Advertencia</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Problema</span>
        </div>
      )}
    </div>
  );
}
