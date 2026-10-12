/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  MessageSquare, 
  Share2, 
  Settings, 
  Eye, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { PageData, CourseCardData, SupportReason } from '../types/pageData';
import { defaultPageData } from '../data/defaultPageData';
import { ImageUploader } from './ImageUploader';

interface AdminPanelProps {
  pageData: PageData;
  onUpdate: (newData: PageData) => void;
  onResetToDefault: () => void;
  onCloseAdmin: () => void;
}

export function AdminPanel({
  pageData,
  onUpdate,
  onResetToDefault,
  onCloseAdmin,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'cards' | 'support' | 'socials' | 'backup'>('profile');
  const [activeCardSubTab, setActiveCardSubTab] = useState<'card1' | 'card2' | 'card3'>('card1');
  const [savedNotice, setSavedNotice] = useState(false);

  const showSaveSuccess = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  // Helper to update top-level section
  const updateSection = <K extends keyof PageData>(key: K, val: PageData[K]) => {
    const updated = { ...pageData, [key]: val };
    onUpdate(updated);
    showSaveSuccess();
  };

  // Helper to update specific course card
  const updateCard = (cardKey: 'card1' | 'card2' | 'card3', newCardData: CourseCardData) => {
    const updated = { ...pageData, [cardKey]: newCardData };
    onUpdate(updated);
    showSaveSuccess();
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pageData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_pagina_hanah_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.profile && json.card1 && json.card2 && json.card3 && json.support && json.socials) {
          onUpdate(json);
          alert('Configurações importadas com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao carregar arquivo de backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const currentCard = pageData[activeCardSubTab];
  const defaultCard = defaultPageData[activeCardSubTab];

  return (
    <div className="min-h-screen bg-[#f4f3f0] text-gray-900 pb-16">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff4612] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ⚙️
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              Painel de Edição Integrado
            </h1>
            <p className="text-[11px] text-gray-500">
              Personalize cada texto, foto, preço e link em tempo real (sem banco de dados)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" /> Salvo!
            </span>
          )}

          <button
            type="button"
            onClick={onCloseAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Página Pública</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil & Biografia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards de Cursos & Modais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Suporte WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('socials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'socials'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Redes Sociais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Backup & Padrões</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          
          {/* ======================================================== */}
          {/* TAB 1: PERFIL & BIOGRAFIA                                */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Foto de Perfil, Nome e Biografia
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Edite a apresentação principal que aparece na coluna esquerda da página.
                </p>
              </div>

              {/* Avatar Uploader */}
              <div className="pt-2">
                <ImageUploader
                  label="Foto do Avatar (Circular)"
                  value={pageData.profile.avatarUrl}
                  defaultValue={defaultPageData.profile.avatarUrl}
                  onChange={(val) =>
                    updateSection('profile', { ...pageData.profile, avatarUrl: val })
                  }
                  aspectRatio="1:1"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Principal
                </label>
                <input
                  type="text"
                  value={pageData.profile.name}
                  onChange={(e) =>
                    updateSection('profile', { ...pageData.profile, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900"
                />
              </div>

              {/* Bio Heading */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Frase de Destaque da Bio
                </label>
                <input
                  type="text"
                  value={pageData.profile.bioHeading}
                  onChange={(e) =>
                    updateSection('profile', { ...pageData.profile, bioHeading: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900"
                />
              </div>

              {/* Bio Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Texto Completo da Bio
                </label>
                <textarea
                  rows={3}
                  value={pageData.profile.bioBody}
                  onChange={(e) =>
                    updateSection('profile', { ...pageData.profile, bioBody: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900 leading-relaxed"
                />
              </div>

              {/* Stats pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estatística 1 (com ícone de alta)
                  </label>
                  <input
                    type="text"
                    value={pageData.profile.stat1}
                    onChange={(e) =>
                      updateSection('profile', { ...pageData.profile, stat1: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estatística 2 (com ícone de fogo)
                  </label>
                  <input
                    type="text"
                    value={pageData.profile.stat2}
                    onChange={(e) =>
                      updateSection('profile', { ...pageData.profile, stat2: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CARDS DE CURSOS & MODAIS                          */}
          {/* ======================================================== */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              
              {/* Card Selector Sub-Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl max-w-xl">
                <button
                  type="button"
                  onClick={() => setActiveCardSubTab('card1')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCardSubTab === 'card1'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Card 1 (Viralização PT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCardSubTab('card2')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCardSubTab === 'card2'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Card 2 (Español)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCardSubTab('card3')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCardSubTab === 'card3'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Card 3 (Roteiros)
                </button>
              </div>

              {/* Sub-Header */}
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Editando: {currentCard.badge}
                </h2>
                <p className="text-xs text-gray-500">
                  Altere os textos que aparecem no card na página e todas as informações detalhadas quando o aluno clica no botão ou no card.
                </p>
              </div>

              {/* Section A: Card Preview Settings */}
              <div className="space-y-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span>1. Visual do Card na Página</span>
                </h3>

                {/* Badge Text & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Texto da Tag/Badge do Card
                    </label>
                    <input
                      type="text"
                      value={currentCard.badge}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, badge: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Cor de Destaque da Tag/Botão
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentCard.badgeColor}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, badgeColor: e.target.value })
                        }
                        className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={currentCard.badgeColor}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, badgeColor: e.target.value })
                        }
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="pt-2">
                  <ImageUploader
                    label="Imagem da Capa do Curso (Vertical 3:4)"
                    value={currentCard.coverImage}
                    defaultValue={defaultCard.coverImage}
                    onChange={(val) =>
                      updateCard(activeCardSubTab, { ...currentCard, coverImage: val })
                    }
                    aspectRatio="3:4"
                  />
                </div>

                {/* Description lines */}
                <div className="pt-2 space-y-3">
                  <label className="block text-xs font-bold text-gray-700">
                    Descrição do Card (Distribuída em 3 Linhas)
                  </label>
                  
                  <div>
                    <span className="text-[11px] text-gray-500 font-medium">Linha 1:</span>
                    <input
                      type="text"
                      value={currentCard.line1}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, line1: e.target.value })
                      }
                      className="w-full mt-1 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Linha 2 (Texto normal):</span>
                      <input
                        type="text"
                        value={currentCard.line2Prefix}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, line2Prefix: e.target.value })
                        }
                        className="w-full mt-1 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Linha 2 (Destaque em negrito):</span>
                      <input
                        type="text"
                        value={currentCard.line2Bold}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, line2Bold: e.target.value })
                        }
                        className="w-full mt-1 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Linha 3 (Destaque em negrito):</span>
                      <input
                        type="text"
                        value={currentCard.line3Bold}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, line3Bold: e.target.value })
                        }
                        className="w-full mt-1 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Linha 3 (Sufixo):</span>
                      <input
                        type="text"
                        value={currentCard.line3Suffix}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, line3Suffix: e.target.value })
                        }
                        className="w-full mt-1 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Texto do Botão no Card
                  </label>
                  <input
                    type="text"
                    value={currentCard.buttonText}
                    onChange={(e) =>
                      updateCard(activeCardSubTab, { ...currentCard, buttonText: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold"
                  />
                </div>
              </div>

              {/* Section B: Modal Details (When Clicked) */}
              <div className="space-y-5 bg-white p-5 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span>2. Informações do Modal (Ao Clicar no Card)</span>
                </h3>

                {/* Modal Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tag Superior do Modal
                    </label>
                    <input
                      type="text"
                      value={currentCard.modalTag}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, modalTag: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nota e Quantidade de Alunos
                    </label>
                    <input
                      type="text"
                      value={currentCard.modalStats}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, modalStats: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Título Principal no Modal
                    </label>
                    <input
                      type="text"
                      value={currentCard.modalTitle}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, modalTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 text-gray-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Subtítulo no Modal
                    </label>
                    <input
                      type="text"
                      value={currentCard.modalSubtitle}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, modalSubtitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                {/* Learning Items List */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-700">
                      Tópicos de Conteúdo / O Que o Aluno Vai Aprender
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = [
                          ...currentCard.learningItems,
                          { title: 'Novo Tópico:', description: 'Descrição do que será ensinado.' },
                        ];
                        updateCard(activeCardSubTab, { ...currentCard, learningItems: newItems });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff4612] hover:text-[#e03a08] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Tópico
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {currentCard.learningItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Título em destaque (ex: Roteirização:)"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...currentCard.learningItems];
                              updated[idx].title = e.target.value;
                              updateCard(activeCardSubTab, { ...currentCard, learningItems: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Descrição explicativa"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...currentCard.learningItems];
                              updated[idx].description = e.target.value;
                              updateCard(activeCardSubTab, { ...currentCard, learningItems: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = currentCard.learningItems.filter((_, i) => i !== idx);
                            updateCard(activeCardSubTab, { ...currentCard, learningItems: updated });
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover tópico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2 Perks Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/60 space-y-2">
                    <label className="block text-xs font-bold text-orange-900">Benefício 1 (Caixa Esquerda)</label>
                    <input
                      type="text"
                      value={currentCard.perk1Title}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, perk1Title: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-orange-300 bg-white"
                    />
                    <input
                      type="text"
                      value={currentCard.perk1Desc}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, perk1Desc: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-orange-300 bg-white"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/60 space-y-2">
                    <label className="block text-xs font-bold text-orange-900">Benefício 2 (Caixa Direita)</label>
                    <input
                      type="text"
                      value={currentCard.perk2Title}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, perk2Title: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-orange-300 bg-white"
                    />
                    <input
                      type="text"
                      value={currentCard.perk2Desc}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, perk2Desc: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-orange-300 bg-white"
                    />
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-800">Valores e Condições de Pagamento</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Tag da Oferta:</span>
                      <input
                        type="text"
                        value={currentCard.offerBadge}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, offerBadge: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Preço Original Riscado:</span>
                      <input
                        type="text"
                        value={currentCard.originalPrice}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, originalPrice: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Preço Parcelado em Destaque:</span>
                      <input
                        type="text"
                        value={currentCard.installmentPrice}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, installmentPrice: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium">Preço à Vista / Observação:</span>
                      <input
                        type="text"
                        value={currentCard.cashPrice}
                        onChange={(e) =>
                          updateCard(activeCardSubTab, { ...currentCard, cashPrice: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkout Link & Button Text */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Texto do Botão de Inscrição / Checkout
                    </label>
                    <input
                      type="text"
                      value={currentCard.checkoutButtonText}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, checkoutButtonText: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm font-bold rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Link de Destino / Checkout (Hotmart, Kiwify, PerfectPay, etc.)
                    </label>
                    <input
                      type="text"
                      value={currentCard.checkoutUrl}
                      onChange={(e) =>
                        updateCard(activeCardSubTab, { ...currentCard, checkoutUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SUPORTE WHATSAPP                                  */}
          {/* ======================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Card de Suporte ao Aluno & Atendimento WhatsApp
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure o número de WhatsApp, as opções de dúvidas e as mensagens automáticas.
                </p>
              </div>

              {/* Card visual fields */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-4">
                <h3 className="text-sm font-bold text-emerald-950">Aparência do Card na Página</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Título do Card</label>
                    <input
                      type="text"
                      value={pageData.support.title}
                      onChange={(e) =>
                        updateSection('support', { ...pageData.support, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Texto do Link de Ação</label>
                    <input
                      type="text"
                      value={pageData.support.linkText}
                      onChange={(e) =>
                        updateSection('support', { ...pageData.support, linkText: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descrição do Card</label>
                  <input
                    type="text"
                    value={pageData.support.subtitle}
                    onChange={(e) =>
                      updateSection('support', { ...pageData.support, subtitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              {/* WhatsApp Number & Modal Texts */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número do WhatsApp (Código do País + DDD + Número)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5511999999999"
                    value={pageData.support.whatsappNumber}
                    onChange={(e) =>
                      updateSection('support', { ...pageData.support, whatsappNumber: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 font-mono text-gray-900"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Insira apenas números (exemplo: 5511999998888 para o Brasil).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Título no Modal</label>
                    <input
                      type="text"
                      value={pageData.support.modalTitle}
                      onChange={(e) =>
                        updateSection('support', { ...pageData.support, modalTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Horário / Subtítulo no Modal</label>
                    <input
                      type="text"
                      value={pageData.support.modalSubtitle}
                      onChange={(e) =>
                        updateSection('support', { ...pageData.support, modalSubtitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Support Reasons List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700">
                    Motivos de Atendimento & Mensagens Pré-formatadas
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newReasons: SupportReason[] = [
                        ...pageData.support.reasons,
                        {
                          id: `motivo_${Date.now()}`,
                          title: 'Novo Assunto',
                          desc: 'Descrição breve da dúvida',
                          message: 'Olá suporte! Gostaria de tirar uma dúvida.',
                        },
                      ];
                      updateSection('support', { ...pageData.support, reasons: newReasons });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Opção
                  </button>
                </div>

                <div className="space-y-3">
                  {pageData.support.reasons.map((reason, index) => (
                    <div
                      key={reason.id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Título do motivo"
                          value={reason.title}
                          onChange={(e) => {
                            const updated = [...pageData.support.reasons];
                            updated[index].title = e.target.value;
                            updateSection('support', { ...pageData.support, reasons: updated });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = pageData.support.reasons.filter((_, i) => i !== index);
                            updateSection('support', { ...pageData.support, reasons: updated });
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Excluir motivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Descrição explicativa curta"
                        value={reason.desc}
                        onChange={(e) => {
                          const updated = [...pageData.support.reasons];
                          updated[index].desc = e.target.value;
                          updateSection('support', { ...pageData.support, reasons: updated });
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                      />

                      <div>
                        <span className="text-[11px] font-semibold text-gray-500">
                          Mensagem que será enviada no WhatsApp:
                        </span>
                        <textarea
                          rows={2}
                          value={reason.message}
                          onChange={(e) => {
                            const updated = [...pageData.support.reasons];
                            updated[index].message = e.target.value;
                            updateSection('support', { ...pageData.support, reasons: updated });
                          }}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REDES SOCIAIS                                     */}
          {/* ======================================================== */}
          {activeTab === 'socials' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Botões e Modais das Redes Sociais
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure seus links de perfil, contadores de seguidores e textos de chamada.
                </p>
              </div>

              {/* Instagram */}
              <div className="p-5 rounded-2xl border border-pink-200/80 bg-pink-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white text-xs">
                    📷
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Instagram</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nome de Usuário (@)</label>
                    <input
                      type="text"
                      value={pageData.socials.instagram.username}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          instagram: { ...pageData.socials.instagram, username: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Seguidores</label>
                    <input
                      type="text"
                      value={pageData.socials.instagram.followers}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          instagram: { ...pageData.socials.instagram, followers: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descrição no Modal</label>
                  <input
                    type="text"
                    value={pageData.socials.instagram.description}
                    onChange={(e) =>
                      updateSection('socials', {
                        ...pageData.socials,
                        instagram: { ...pageData.socials.instagram, description: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Texto do Botão</label>
                    <input
                      type="text"
                      value={pageData.socials.instagram.buttonText}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          instagram: { ...pageData.socials.instagram, buttonText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Link do Perfil</label>
                    <input
                      type="text"
                      value={pageData.socials.instagram.url}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          instagram: { ...pageData.socials.instagram, url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* YouTube */}
              <div className="p-5 rounded-2xl border border-red-200/80 bg-red-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#ff0000] flex items-center justify-center text-white text-xs">
                    ▶
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">YouTube</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Canal</label>
                    <input
                      type="text"
                      value={pageData.socials.youtube.username}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          youtube: { ...pageData.socials.youtube, username: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Inscritos</label>
                    <input
                      type="text"
                      value={pageData.socials.youtube.followers}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          youtube: { ...pageData.socials.youtube, followers: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descrição no Modal</label>
                  <input
                    type="text"
                    value={pageData.socials.youtube.description}
                    onChange={(e) =>
                      updateSection('socials', {
                        ...pageData.socials,
                        youtube: { ...pageData.socials.youtube, description: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Texto do Botão</label>
                    <input
                      type="text"
                      value={pageData.socials.youtube.buttonText}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          youtube: { ...pageData.socials.youtube, buttonText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Link do Canal</label>
                    <input
                      type="text"
                      value={pageData.socials.youtube.url}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          youtube: { ...pageData.socials.youtube, url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* TikTok */}
              <div className="p-5 rounded-2xl border border-gray-300 bg-gray-50/70 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-white text-xs">
                    ♪
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">TikTok</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nome de Usuário (@)</label>
                    <input
                      type="text"
                      value={pageData.socials.tiktok.username}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          tiktok: { ...pageData.socials.tiktok, username: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Seguidores</label>
                    <input
                      type="text"
                      value={pageData.socials.tiktok.followers}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          tiktok: { ...pageData.socials.tiktok, followers: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descrição no Modal</label>
                  <input
                    type="text"
                    value={pageData.socials.tiktok.description}
                    onChange={(e) =>
                      updateSection('socials', {
                        ...pageData.socials,
                        tiktok: { ...pageData.socials.tiktok, description: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Texto do Botão</label>
                    <input
                      type="text"
                      value={pageData.socials.tiktok.buttonText}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          tiktok: { ...pageData.socials.tiktok, buttonText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Link do Perfil</label>
                    <input
                      type="text"
                      value={pageData.socials.tiktok.url}
                      onChange={(e) =>
                        updateSection('socials', {
                          ...pageData.socials,
                          tiktok: { ...pageData.socials.tiktok, url: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: BACKUP & PADRÕES                                  */}
          {/* ======================================================== */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Backup, Restauração e Como Acessar o Painel
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Gerencie seus dados e entenda como acessar este painel a qualquer momento.
                </p>
              </div>

              {/* URL Access Guide */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>Como acessar este painel:</span>
                </div>
                <p>
                  Basta colocar a palavra <strong>admin</strong> ou <strong>admim</strong> no final do link da página no seu navegador:
                </p>
                <div className="p-2 rounded bg-white/80 border border-amber-200 font-mono text-[11px] text-gray-800 break-all select-all">
                  {window.location.origin}{window.location.pathname}?admin
                </div>
                <p className="text-[11px] text-amber-800">
                  Também funciona com <code>?admim</code>, <code>#admin</code> ou <code>#admim</code>. Todas as alterações ficam salvas no seu navegador instantaneamente!
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                  <h3 className="font-bold text-xs text-gray-900">Baixar Cópia dos Dados (Backup JSON)</h3>
                  <p className="text-[11px] text-gray-500">
                    Salve um arquivo de backup no seu computador com todas as personalizações feitas.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Backup (JSON)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                  <h3 className="font-bold text-xs text-gray-900">Restaurar de um Arquivo JSON</h3>
                  <p className="text-[11px] text-gray-500">
                    Importe um arquivo de backup salvo anteriormente.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold border border-gray-300 shadow-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Importar Backup (JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="pt-4 border-t border-gray-200">
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-xs text-red-950">Restaurar Conteúdo Original</h3>
                    <p className="text-[11px] text-red-700">
                      Restaura todos os textos, imagens e preços para os dados originais da página de Hanah Franklin.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja restaurar todos os dados para o padrão original da Hanah Franklin?')) {
                        onResetToDefault();
                        alert('Dados restaurados com sucesso!');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Padrões</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
