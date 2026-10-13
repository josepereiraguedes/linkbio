/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  RotateCcw, 
  UserCheck, 
  Scissors, 
  Check, 
  Crosshair,
  Sparkles
} from 'lucide-react';
import { ProfileData } from '../types/pageData';

interface ProfilePhotoFramerProps {
  profile: ProfileData;
  onChange: (updatedProfile: ProfileData) => void;
}

export function ProfilePhotoFramer({ profile, onChange }: ProfilePhotoFramerProps) {
  const zoom = profile.avatarZoom ?? 100;
  const posX = profile.avatarPosX ?? 50;
  const posY = profile.avatarPosY ?? 50;

  const [isDragging, setIsDragging] = useState(false);
  const [cropSuccess, setCropSuccess] = useState(false);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const dragStartRef = useRef<{ startMouseX: number; startMouseY: number; startPosX: number; startPosY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFraming = (newZoom: number, newX: number, newY: number) => {
    onChange({
      ...profile,
      avatarZoom: Math.min(250, Math.max(100, Math.round(newZoom))),
      avatarPosX: Math.min(100, Math.max(0, Math.round(newX))),
      avatarPosY: Math.min(100, Math.max(0, Math.round(newY))),
    });
  };

  // Mouse & Touch Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: posX,
      startPosY: posY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.startMouseX;
    const deltaY = e.clientY - dragStartRef.current.startMouseY;

    // Sensitivity scaled inversely with zoom
    const sensitivity = (100 / zoom) * 0.45;
    const newX = dragStartRef.current.startPosX - (deltaX / rect.width) * 100 * sensitivity;
    const newY = dragStartRef.current.startPosY - (deltaY / rect.height) * 100 * sensitivity;

    updateFraming(zoom, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Canvas Crop & Export
  const handleApplyCanvasCrop = () => {
    if (!profile.avatarUrl) return;
    setIsProcessingCrop(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 640;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessingCrop(false);
          return;
        }

        // Draw with current position and zoom
        const scale = zoom / 100;
        const imgAspect = img.width / img.height;
        let drawWidth = size * scale;
        let drawHeight = size * scale;

        if (imgAspect > 1) {
          drawWidth = size * imgAspect * scale;
        } else {
          drawHeight = (size / imgAspect) * scale;
        }

        const focalX = (posX / 100) * drawWidth;
        const focalY = (posY / 100) * drawHeight;

        const drawX = size / 2 - focalX;
        const drawY = size / 2 - focalY;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.94);
        onChange({
          ...profile,
          avatarUrl: croppedBase64,
          avatarZoom: 100,
          avatarPosX: 50,
          avatarPosY: 50,
        });

        setCropSuccess(true);
        setTimeout(() => setCropSuccess(false), 3000);
      } catch (err) {
        console.warn('Canvas crop fallback (due to cross-origin or canvas error):', err);
      } finally {
        setIsProcessingCrop(false);
      }
    };

    img.onerror = () => {
      setIsProcessingCrop(false);
    };

    img.src = profile.avatarUrl;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#ff4612]/10 text-[#ff4612]">
              <Move className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-gray-900">
              Enquadramento & Ajuste da Foto de Perfil
            </h3>
          </div>
          <p className="text-[11.5px] text-gray-500 mt-0.5">
            Arraste diretamente sobre a foto ou use os controles para centralizar o rosto no círculo.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => updateFraming(125, 50, 25)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-orange-50 hover:text-[#ff4612] text-gray-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Posiciona o foco mais alto, ideal para destacar o rosto"
          >
            <UserCheck className="w-3 h-3 text-[#ff4612]" />
            <span>Foco no Rosto</span>
          </button>
          <button
            type="button"
            onClick={() => updateFraming(zoom, 50, 50)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Centralizar perfeitamente"
          >
            <Crosshair className="w-3 h-3 text-gray-500" />
            <span>Centralizar</span>
          </button>
          <button
            type="button"
            onClick={() => updateFraming(100, 50, 50)}
            className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Restaurar padrão original"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      {/* Main interactive area: Circular preview & Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
        
        {/* Interactive Viewport */}
        <div className="flex flex-col items-center">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden bg-gray-100 border-[5px] border-white shadow-md select-none touch-none ${
              isDragging ? 'cursor-grabbing ring-4 ring-[#ff4612]/30' : 'cursor-grab hover:ring-2 hover:ring-[#ff4612]/20'
            }`}
            style={{ userSelect: 'none' }}
          >
            <img
              src={profile.avatarUrl}
              alt="Prévia de Enquadramento"
              draggable={false}
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-75"
              style={{
                objectPosition: `${posX}% ${posY}%`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: `${posX}% ${posY}%`,
              }}
            />

            {/* Verification badge preview */}
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md border border-gray-100 pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-[#ff4612] flex items-center justify-center text-white text-[11px] font-bold">
                ✓
              </div>
            </div>

            {/* Drag guide overlay when hovering/idle */}
            <div className="absolute inset-0 bg-black/15 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-black/70 text-white text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-xs">
                <Move className="w-3 h-3" /> Arraste para enquadrar
              </span>
            </div>
          </div>

          <span className="text-[11px] text-gray-500 mt-2 font-medium">
            Prévia real no tamanho ampliado
          </span>
        </div>

        {/* Sliders and Fine Controls */}
        <div className="space-y-4">
          
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#ff4612]" />
                Zoom / Aproximar ({zoom}%)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateFraming(zoom - 10, posX, posY)}
                  disabled={zoom <= 100}
                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  title="Diminuir zoom"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => updateFraming(zoom + 10, posX, posY)}
                  disabled={zoom >= 250}
                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  title="Aumentar zoom"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="250"
              step="1"
              value={zoom}
              onChange={(e) => updateFraming(Number(e.target.value), posX, posY)}
              className="w-full accent-[#ff4612] cursor-pointer h-2 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Original (100%)</span>
              <span>Médio (175%)</span>
              <span>Máximo (250%)</span>
            </div>
          </div>

          {/* Vertical Position Slider (Y) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-gray-500 rotate-90" />
                Posição Vertical (Cima ↕ Baixo): {posY}%
              </span>
              <span className="text-[11px] text-gray-500">
                {posY < 40 ? 'Foco no topo' : posY > 60 ? 'Foco na base' : 'Central'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={posY}
              onChange={(e) => updateFraming(zoom, posX, Number(e.target.value))}
              className="w-full accent-[#ff4612] cursor-pointer h-2 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Topo (0%)</span>
              <span>Centro (50%)</span>
              <span>Base (100%)</span>
            </div>
          </div>

          {/* Horizontal Position Slider (X) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-gray-500" />
                Posição Horizontal (Esquerda ↔ Direita): {posX}%
              </span>
              <span className="text-[11px] text-gray-500">
                {posX < 40 ? 'Mais à esquerda' : posX > 60 ? 'Mais à direita' : 'Central'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={posX}
              onChange={(e) => updateFraming(zoom, Number(e.target.value), posY)}
              className="w-full accent-[#ff4612] cursor-pointer h-2 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Esquerda (0%)</span>
              <span>Centro (50%)</span>
              <span>Direita (100%)</span>
            </div>
          </div>

          {/* Optional Direct Crop Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <div className="text-[11.5px] text-gray-600">
              <span className="font-semibold text-gray-800">Recorte instantâneo:</span> Os ajustes acima já são aplicados automaticamente na sua página e salvos no banco de dados.
            </div>
            <button
              type="button"
              onClick={handleApplyCanvasCrop}
              disabled={isProcessingCrop}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#ff4612] hover:text-[#ff4612] text-gray-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Gera um arquivo quadrado já recortado com estas dimensões"
            >
              {cropSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Recorte Salvo!</span>
                </>
              ) : (
                <>
                  <Scissors className="w-3.5 h-3.5 text-gray-500" />
                  <span>{isProcessingCrop ? 'Recortando...' : 'Fixar Recorte 1:1'}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
