/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, Link2, RotateCcw, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  defaultValue?: string;
  onChange: (newValue: string) => void;
  aspectRatio?: '1:1' | '3:4';
}

function compressImageFile(file: File, maxDimension = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Skip resizing if already small
        if (width <= maxDimension && height <= maxDimension && file.size < 180 * 1024) {
          resolve(dataUrl);
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  label,
  value,
  defaultValue,
  onChange,
  aspectRatio = '3:4',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsCompressing(true);
      const optimizedBase64 = await compressImageFile(file);
      if (optimizedBase64) {
        onChange(optimizedBase64);
      }
    } catch (err) {
      console.warn('Erro ao otimizar imagem, usando fallback direto:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) onChange(base64);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-700">{label}</label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Thumbnail Preview */}
        <div
          className={`shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-xs flex items-center justify-center ${
            aspectRatio === '1:1' ? 'w-16 h-16 rounded-full' : 'w-14 h-20'
          }`}
        >
          {value ? (
            <img
              src={value}
              alt="Prévia"
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/150?text=Erro';
              }}
            />
          ) : (
            <span className="text-[10px] text-gray-400">Sem foto</span>
          )}
        </div>

        {/* Input & Action buttons */}
        <div className="flex-1 w-full space-y-2">
          {/* URL Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Cole o link da imagem (URL) ou envie do computador..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] bg-white transition-all text-gray-800"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-3 h-3 text-[#ff4612] animate-spin" />
                  <span>Otimizando imagem...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 text-gray-500" />
                  <span>Enviar do Computador</span>
                </>
              )}
            </button>

            {defaultValue && value !== defaultValue && (
              <button
                type="button"
                onClick={() => onChange(defaultValue)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-amber-700 hover:bg-amber-50 text-[11px] font-medium transition-colors cursor-pointer"
                title="Restaurar imagem original"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Original</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
