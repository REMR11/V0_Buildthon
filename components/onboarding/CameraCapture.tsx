"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, Upload, RefreshCw, X, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CameraCaptureProps {
  mode: "document" | "selfie";
  label: string;
  sublabel?: string;
  onCapture: (file: File) => void;
}

type CamState = "idle" | "requesting" | "live" | "captured" | "error";

interface QualityChecks {
  brightness: "good" | "warn" | "bad" | null;
  focus: "good" | "bad" | null;
  framing: "good" | "bad" | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function analyzeBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const step = 8;
  const data = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  let count = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

function analyzeFocus(ctx: CanvasRenderingContext2D, w: number, h: number): number {
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
  return sum2 / count - mean * mean;
}

// ---------------------------------------------------------------------------
// Quality chip
// ---------------------------------------------------------------------------
function QualityChip({
  status,
  label,
}: {
  status: "good" | "warn" | "bad" | null;
  label: string;
}) {
  if (status === null) return null;
  const dot =
    status === "good" ? "bg-green-400" :
    status === "warn" ? "bg-yellow-400" :
    "bg-red-400";
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Corner brackets for document mode
// ---------------------------------------------------------------------------
function DocumentGuide() {
  const base = "absolute w-7 h-7 border-[3px] border-[#D85A30]";
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <span className={`${base} top-4 left-4 border-r-0 border-b-0 rounded-tl`} />
      <span className={`${base} top-4 right-4 border-l-0 border-b-0 rounded-tr`} />
      <span className={`${base} bottom-4 left-4 border-r-0 border-t-0 rounded-bl`} />
      <span className={`${base} bottom-4 right-4 border-l-0 border-t-0 rounded-br`} />
      <div className="absolute bottom-14 inset-x-0 flex justify-center">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
          Alinea el documento dentro del marco
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Oval guide for selfie mode
// ---------------------------------------------------------------------------
function SelfieGuide() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-hidden>
      <div
        className="border-[3px] border-white/70 rounded-full"
        style={{ width: "60%", paddingBottom: "72%" }}
      />
      <div className="absolute bottom-14 inset-x-0 flex justify-center">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
          Centra tu rostro en el óvalo
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CameraCapture({ mode, label, sublabel, onCapture }: CameraCaptureProps) {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const analysisCanvas  = useRef<HTMLCanvasElement | null>(null);
  const analysisTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const errorFileRef    = useRef<HTMLInputElement>(null);

  const [camState, setCamState]         = useState<CamState>("idle");
  const [errorMsg, setErrorMsg]         = useState("");
  const [previewUrl, setPreviewUrl]     = useState("");
  const [quality, setQuality]           = useState<QualityChecks>({ brightness: null, focus: null, framing: null });

  // ── Cleanup stream on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (analysisTimer.current) clearInterval(analysisTimer.current);
    };
  }, []);

  // ── Stop stream ───────────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (analysisTimer.current) {
      clearInterval(analysisTimer.current);
      analysisTimer.current = null;
    }
  }, []);

  // ── Quality analysis loop ─────────────────────────────────────────────────
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
    const focusVar   = analyzeFocus(ctx, w, h);
    const isLandscape = w > h;

    setQuality({
      brightness:
        brightness > 80  ? "good" :
        brightness >= 50 ? "warn" : "bad",
      focus:   focusVar > 100 ? "good" : "bad",
      framing: mode === "document"
        ? isLandscape ? "good" : "bad"
        : !isLandscape ? "good" : "bad",
    });
  }, [mode]);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamState("requesting");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode === "selfie" ? "user" : "environment",
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCamState("live");
      analysisTimer.current = setInterval(runAnalysis, 600);
    } catch {
      stopStream();
      setErrorMsg("No pudimos acceder a tu cámara.");
      setCamState("error");
      // Auto-open file picker as fallback
      setTimeout(() => errorFileRef.current?.click(), 400);
    }
  }, [mode, runAnalysis, stopStream]);

  // ── Capture frame ─────────────────────────────────────────────────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth  || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `${mode}-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopStream();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setCamState("captured");
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }, [mode, stopStream, onCapture]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setQuality({ brightness: null, focus: null, framing: null });
    setCamState("idle");
  }, [previewUrl]);

  // ── File upload handler (both normal upload + error fallback) ─────────────
  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      stopStream();
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCamState("captured");
      onCapture(file);
      e.target.value = "";
    },
    [stopStream, onCapture],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Aspect ratio: 16/9 for documents, square-ish circle container for selfie
  const boxStyle: React.CSSProperties =
    mode === "document"
      ? { aspectRatio: "16/9" }
      : { aspectRatio: "1/1", borderRadius: "50%", overflow: "hidden" };

  // For selfie idle state, show circular placeholder
  const idleRounding = mode === "selfie" ? "rounded-full" : "rounded-2xl";

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`Subir archivo — ${label}`}
        onChange={handleFile}
      />
      <input
        ref={errorFileRef}
        type="file"
        accept="image/*"
        capture={mode === "selfie" ? "user" : "environment"}
        className="sr-only"
        aria-label={`Subir foto — ${label}`}
        onChange={handleFile}
      />

      {/* Main box */}
      <div
        className={`relative w-full overflow-hidden border-2 border-dashed border-border bg-secondary ${
          camState !== "live" && camState !== "captured" ? idleRounding : mode === "document" ? "rounded-2xl" : "rounded-full"
        }`}
        style={boxStyle}
      >
        {/* ── IDLE ── */}
        {(camState === "idle" || camState === "requesting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-sm">
              <Camera size={26} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground/80 text-balance">{label}</p>
              {sublabel && (
                <p className="text-xs text-muted mt-1 leading-relaxed text-balance">{sublabel}</p>
              )}
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground/70 hover:border-primary/50 hover:text-primary transition-all"
              >
                <Upload size={14} />
                Subir archivo
              </button>
              <button
                type="button"
                disabled={camState === "requesting"}
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-all disabled:opacity-60"
              >
                <Camera size={14} />
                {camState === "requesting" ? "Abriendo..." : "Tomar foto"}
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {camState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <AlertTriangle size={22} className="text-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground/80">No pudimos acceder a tu cámara.</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Puedes subir una foto desde tu galería.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setCamState("idle"); setErrorMsg(""); }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground/70 hover:border-primary/50 transition-all"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all"
              >
                Subir foto
              </button>
            </div>
          </div>
        )}

        {/* ── LIVE ── */}
        {camState === "live" && (
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

            {/* Quality chips — top left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <QualityChip
                status={quality.brightness}
                label={
                  quality.brightness === "good" ? "Buena luz" :
                  quality.brightness === "warn" ? "Poca luz"  : "Muy oscuro"
                }
              />
              <QualityChip
                status={quality.focus}
                label={quality.focus === "good" ? "Enfocado" : "Desenfocado"}
              />
              <QualityChip
                status={quality.framing}
                label={
                  mode === "document"
                    ? quality.framing === "good" ? "Horizontal OK" : "Gira horizontal"
                    : quality.framing === "good" ? "Encuadre OK"   : "Gira vertical"
                }
              />
            </div>

            {/* Cancel — top right */}
            <button
              type="button"
              aria-label="Cancelar"
              onClick={() => { stopStream(); setCamState("idle"); setQuality({ brightness: null, focus: null, framing: null }); }}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              <X size={17} />
            </button>

            {/* Capture button — bottom center */}
            <div className="absolute bottom-5 inset-x-0 flex justify-center z-10">
              <button
                type="button"
                aria-label="Capturar foto"
                onClick={captureFrame}
                className="w-16 h-16 rounded-full bg-[#D85A30] shadow-lg flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
              >
                <Camera size={24} className="text-white" />
              </button>
            </div>
          </>
        )}

        {/* ── CAPTURED ── */}
        {camState === "captured" && previewUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Foto capturada"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: mode === "selfie" ? "scaleX(-1)" : "none" }}
            />
            {/* Saved badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
                Foto guardada ✓
              </span>
            </div>
            {/* Retry button */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center z-10">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 rounded-xl bg-black/60 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/80 transition-all"
              >
                <RefreshCw size={14} /> Repetir
              </button>
            </div>
          </>
        )}
      </div>

      {/* Quality legend — only while live */}
      {camState === "live" && (
        <div className="flex items-center gap-3 justify-center text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Bueno
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Advertencia
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Problema
          </span>
        </div>
      )}

      {/* Privacy notice */}
      <p className="text-[11px] text-muted text-center leading-relaxed">
        Tus datos están cifrados y solo se usan para verificar tu identidad.
      </p>
    </div>
  );
}
