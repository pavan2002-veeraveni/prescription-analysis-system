import { useState, useCallback } from "react";
import { Upload, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }, [disabled]);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  if (preview) {
    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-elevated bg-card border border-border">
          <img src={preview} alt="Prescription preview" className="w-full h-auto max-h-96 object-contain" />
          <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 rounded-full bg-card/90 backdrop-blur-sm border border-border hover:bg-red-500 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      className={cn("relative w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 bg-card/50 backdrop-blur-sm",
        isDragOver ? "border-primary bg-accent scale-[1.02] shadow-elevated" : "border-border hover:border-primary/50 hover:shadow-card",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
      <label className={cn("flex flex-col items-center justify-center p-12 cursor-pointer", disabled && "cursor-not-allowed")}>
        <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 bg-gradient-hero shadow-soft", isDragOver && "scale-110")}>
          <Upload className="w-10 h-10 text-primary-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">Upload Prescription Image</h3>
        <p className="text-muted-foreground text-center mb-6">Drag and drop your handwritten prescription, or click to browse</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Image className="w-4 h-4" />
          <span>Supports JPG, PNG, WEBP</span>
        </div>
        <input type="file" accept="image/*" onChange={handleFileInput} disabled={disabled} className="hidden" />
      </label>
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-glow opacity-50 blur-3xl" />
    </div>
  );
}
