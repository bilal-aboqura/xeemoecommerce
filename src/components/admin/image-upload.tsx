"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, Loader2, Link as LinkIcon, X, Crop, Check, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from "@/components/admin/toast";

const inputCls = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-brand";

interface CropState {
  scale: number;
  x: number;
  y: number;
}

const ASPECT_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

/**
 * Image upload with crop/fit modal.
 * User can drag to reposition, zoom with slider, and select aspect ratio.
 * The cropped image is generated via canvas and uploaded.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Image",
  lang = "en",
  aspectRatio = 1,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  lang?: "en" | "ar";
  aspectRatio?: number;
}) {
  const ar = lang === "ar";
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImage, setRawImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<CropState>({ scale: 1, x: 0, y: 0 });
  const [selectedAspect, setSelectedAspect] = useState(aspectRatio);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(ar ? "الملف مش صورة" : "Not an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(ar ? "الصورة كبيرة جداً (حد أقصى 10 ميجا)" : "Image too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        setRawImage(img);
        setCrop({ scale: 1, x: 0, y: 0 });
        setShowCropModal(true);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);

    if (fileRef.current) fileRef.current.value = "";
  }

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setCrop((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  }

  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function generateCroppedBlob(): Promise<Blob | null> {
    if (!rawImage || !canvasRef.current) return Promise.resolve(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);

    const outputSize = 800;
    const aspect = selectedAspect;
    const w = aspect >= 1 ? outputSize : Math.round(outputSize * aspect);
    const h = aspect >= 1 ? Math.round(outputSize / aspect) : outputSize;

    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const containerEl = containerRef.current;
    if (!containerEl) return Promise.resolve(null);

    const containerW = containerEl.clientWidth;
    const containerH = containerEl.clientHeight;

    const imgAspect = rawImage.width / rawImage.height;
    const containerAspect = containerW / containerH;

    let baseW: number, baseH: number;
    if (imgAspect > containerAspect) {
      baseH = containerH;
      baseW = containerH * imgAspect;
    } else {
      baseW = containerW;
      baseH = containerW / imgAspect;
    }

    const scaledW = baseW * crop.scale;
    const scaledH = baseH * crop.scale;

    const offsetX = crop.x + (containerW - scaledW) / 2;
    const offsetY = crop.y + (containerH - scaledH) / 2;

    const cropXOnImg = -offsetX / scaledW * rawImage.width;
    const cropYOnImg = -offsetY / scaledH * rawImage.height;
    const cropWOnImg = containerW / scaledW * rawImage.width;
    const cropHOnImg = containerH / scaledH * rawImage.height;

    ctx.drawImage(
      rawImage,
      Math.max(0, cropXOnImg),
      Math.max(0, cropYOnImg),
      Math.min(cropWOnImg, rawImage.width),
      Math.min(cropHOnImg, rawImage.height),
      0, 0, w, h,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.9);
    });
  }

  async function handleCropConfirm() {
    const blob = await generateCroppedBlob();
    if (!blob) {
      toast.error(ar ? "فشل معالجة الصورة" : "Failed to process image");
      return;
    }

    setShowCropModal(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, `cropped_${Date.now()}.webp`);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.url) {
        onChange(data.url);
        toast.success(ar ? "تم رفع الصورة" : "Image uploaded");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setShowUrlInput(true);
    } finally {
      setUploading(false);
      setRawImage(null);
    }
  }

  function handleCropCancel() {
    setShowCropModal(false);
    setRawImage(null);
    setCrop({ scale: 1, x: 0, y: 0 });
  }

  function resetCrop() {
    setCrop({ scale: 1, x: 0, y: 0 });
  }

  const cropContainerAspect = selectedAspect;

  return (
    <div>
      <span className="mb-1 block text-xs text-fg-dim">{label}</span>

      {/* Preview */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white">
        {value ? (
          <>
            <Image src={value} alt="" fill sizes="160px" className="object-contain p-2" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white/80 transition hover:bg-black/80 hover:text-white"
              title={ar ? "إزالة" : "Remove"}
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-fg-dim">
            {ar ? "مفيش صورة" : "No image"}
          </div>
        )}
      </div>

      {/* Upload + URL toggle */}
      <div className="mt-2 flex gap-1.5">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-fg-muted transition hover:border-brand/40 hover:text-fg disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? (ar ? "جارٍ الرفع..." : "Uploading...") : (ar ? "ارفع صورة" : "Upload")}
        </button>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-fg-muted transition hover:border-brand/40 hover:text-fg"
          title={ar ? "أدخل رابط" : "Enter URL"}
        >
          <LinkIcon size={14} />
        </button>
      </div>

      {/* URL input (toggle) */}
      {showUrlInput && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} mt-1.5`}
          placeholder="/images/product.webp"
        />
      )}

      {/* Crop Modal */}
      {showCropModal && rawImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-elevated w-full max-w-2xl p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crop size={18} className="text-brand" />
                <h3 className="text-base font-semibold text-fg">
                  {ar ? "اضبط الصورة" : "Adjust Image"}
                </h3>
              </div>
              <button onClick={handleCropCancel} className="text-fg-dim transition hover:text-fg">
                <X size={20} />
              </button>
            </div>

            {/* Crop area */}
            <div className="flex justify-center">
              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl border-2 border-brand/30 bg-black"
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  aspectRatio: String(cropContainerAspect),
                  cursor: dragging ? "grabbing" : "grab",
                  touchAction: "none",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rawImage.src}
                  alt="Crop preview"
                  className="pointer-events-none absolute select-none"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "none",
                    maxHeight: "none",
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.scale})`,
                    transformOrigin: "center center",
                    left: "50%",
                    top: "50%",
                    marginLeft: `-${rawImage.width / 2}px`,
                    marginTop: `-${rawImage.height / 2}px`,
                    opacity: 0.9,
                  }}
                  draggable={false}
                />

                {/* Grid overlay */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
                  <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
                  <div className="absolute top-1/3 left-0 h-px w-full bg-white/20" />
                  <div className="absolute top-2/3 left-0 h-px w-full bg-white/20" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 space-y-3">
              {/* Aspect ratio */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-dim">{ar ? "النسبة:" : "Ratio:"}</span>
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setSelectedAspect(r.value)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                      selectedAspect === r.value
                        ? "bg-brand text-white"
                        : "border border-white/15 bg-white/5 text-fg-muted hover:border-brand/40"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-2">
                <button onClick={() => setCrop((p) => ({ ...p, scale: Math.max(0.5, p.scale - 0.1) }))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-fg-muted transition hover:text-fg">
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={crop.scale}
                  onChange={(e) => setCrop((p) => ({ ...p, scale: Number(e.target.value) }))}
                  className="flex-1 accent-brand"
                />
                <button onClick={() => setCrop((p) => ({ ...p, scale: Math.min(3, p.scale + 0.1) }))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-fg-muted transition hover:text-fg">
                  <ZoomIn size={14} />
                </button>
                <span className="w-10 text-right text-xs text-fg-dim">{Math.round(crop.scale * 100)}%</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button onClick={resetCrop} className="rounded-lg px-3 py-2 text-xs font-medium text-fg-dim transition hover:text-fg">
                  {ar ? "إعادة ضبط" : "Reset"}
                </button>
                <div className="flex gap-2">
                  <button onClick={handleCropCancel} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-fg-muted transition hover:text-fg">
                    {ar ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {uploading ? (ar ? "جارٍ الرفع..." : "Uploading...") : (ar ? "حفظ" : "Save")}
                  </button>
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
