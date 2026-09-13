"use client";

import React, { useRef, useState, ChangeEvent, DragEvent } from "react";
import { Camera, UploadCloud, X, RefreshCw, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (base64Image: string, mimeType: string, previewUrl: string) => void;
  onClearImage?: () => void;
  isLoading?: boolean;
  label?: string;
  sublabel?: string;
}

export default function ImageUploader({
  onImageSelected,
  onClearImage,
  isLoading = false,
  label = "Chụp hoặc tải ảnh lên",
  sublabel = "Hỗ trợ định dạng JPG, PNG, WEBP",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tập tin hình ảnh (JPG, PNG, WEBP...)");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = () => {
      const fullDataUrl = reader.result as string;
      setPreview(fullDataUrl);

      // Cắt bỏ phần "data:image/xxx;base64," để lấy chuỗi Base64 nguyên bản
      const matches = fullDataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        onImageSelected(base64Data, mimeType, fullDataUrl);
      } else {
        const commaIndex = fullDataUrl.indexOf(",");
        const base64Data = commaIndex !== -1 ? fullDataUrl.substring(commaIndex + 1) : fullDataUrl;
        onImageSelected(base64Data, file.type, fullDataUrl);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClearImage) {
      onClearImage();
    }
  };

  return (
    <div className="w-full">
      {/* Input ẩn để kích hoạt camera / chọn file */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
            isDragging
              ? "border-orange-500 bg-orange-500/10"
              : "border-[#1e2638] hover:border-orange-500/60 bg-[#141b2b]/60 hover:bg-[#141b2b]"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#101522] border border-[#1e2638] text-orange-500 shadow-md">
            <Camera className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="font-bold text-white text-base">
              {label}
            </p>
            <p className="text-xs text-neutral-400">
              {sublabel}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition">
            <UploadCloud className="w-4 h-4 text-orange-500" />
            <span>Chọn hoặc chụp ảnh</span>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-[#1e2638] bg-[#0c0f17] shadow-xl">
          <div className="relative w-full aspect-video sm:aspect-[2/1] max-h-72 overflow-hidden flex items-center justify-center bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Ảnh đã chọn"
              className="max-h-72 w-full object-contain rounded-xl"
            />
          </div>

          <div className="p-3 bg-[#101522] border-t border-[#1e2638] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate text-xs text-neutral-300">
              <ImageIcon className="w-4 h-4 shrink-0 text-orange-400" />
              <span className="truncate font-semibold">{fileName || "Ảnh đã tải lên"}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[#1e2638] bg-[#141b2b] hover:bg-[#1a2338] text-neutral-200 transition"
                title="Đổi ảnh khác"
              >
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                <span>Đổi ảnh</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClear}
                className="inline-flex items-center p-1.5 text-xs font-medium rounded-xl border border-[#1e2638] bg-[#141b2b] text-neutral-400 hover:text-red-400 hover:bg-red-950/40 hover:border-red-900/50 transition"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
