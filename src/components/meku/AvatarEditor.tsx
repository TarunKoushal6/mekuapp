// AvatarEditor — pinch/drag zoom + rotate on a square canvas with a circular
// crop ring. Output is a square PNG blob matching the visible crop.
import { useCallback, useEffect, useRef, useState } from "react";
import { IconRotate, IconCheck, IconBack } from "./MekuIcon";
import { Loader2 } from "lucide-react";

interface Props {
  file: File;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void> | void;
}

const SIZE = 320; // square canvas size

export const AvatarEditor = ({ file, onCancel, onSave }: Props) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Load file → image
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => {
      setImg(i);
      // fit image so the smaller side fills the circle
      const base = Math.max(SIZE / i.width, SIZE / i.height);
      setZoom(base);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
    };
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Draw
  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !img) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = SIZE * dpr;
    c.height = SIZE * dpr;
    c.style.width = `${SIZE}px`;
    c.style.height = `${SIZE}px`;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.save();
    ctx.translate(SIZE / 2 + offset.x, SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }, [img, zoom, rotation, offset]);

  useEffect(() => { draw(); }, [draw]);

  // Drag
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  };
  const onPointerUp = () => { dragRef.current = null; };

  // Export
  const save = async () => {
    const c = canvasRef.current;
    if (!c) return;
    setBusy(true);
    try {
      // Render into a clean square canvas (no DPR scaling) for upload
      const out = document.createElement("canvas");
      out.width = 512; out.height = 512;
      const octx = out.getContext("2d")!;
      // round mask
      octx.beginPath();
      octx.arc(256, 256, 256, 0, Math.PI * 2);
      octx.closePath();
      octx.clip();
      const scale = 512 / SIZE;
      octx.translate(256 + offset.x * scale, 256 + offset.y * scale);
      octx.rotate((rotation * Math.PI) / 180);
      octx.scale(zoom * scale, zoom * scale);
      if (img) octx.drawImage(img, -img.width / 2, -img.height / 2);
      const blob: Blob = await new Promise((r) =>
        out.toBlob((b) => r(b!), "image/png", 0.92)!,
      );
      await onSave(blob);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-[56px] items-center justify-between px-3">
        <button onClick={onCancel} className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <IconBack size={22} />
        </button>
        <h2 className="text-[15px] font-bold">Edit photo</h2>
        <button
          onClick={save}
          disabled={busy || !img}
          className="tap inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><IconCheck size={14} /> Save</>}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="block touch-none rounded-md"
          />
          {/* circular crop ring */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 0 9999px hsl(0 0% 0% / 0.55)`,
              border: "2px solid hsl(var(--primary))",
            }}
          />
        </div>

        <div className="mt-6 w-full max-w-[320px] space-y-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Zoom</span>
            <input
              type="range"
              min={0.2}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <label className="flex-1">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rotate</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-[hsl(var(--primary))]"
              />
            </label>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="tap mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
              aria-label="Rotate 90°"
            >
              <IconRotate size={16} />
            </button>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">Drag to position · The circle is what other users see.</p>
      </div>
    </div>
  );
};
