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
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  Database,
  Check,
  Copy,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Server,
  Lock,
  LogOut,
  ShieldCheck,
  Key,
  EyeOff
} from 'lucide-react';
import { PageData, CourseCardData, SupportReason } from '../types/pageData';
import { defaultPageData } from '../data/defaultPageData';
import { ImageUploader } from './ImageUploader';
import { 
  getActiveSupabaseCredentials, 
  saveCustomSupabaseCredentials, 
  clearCustomSupabaseCredentials, 
  testSupabaseConnection,
  saveRemotePageConfig,
  fetchRemotePageConfig,
  isSupabaseConfigured,
  SUPABASE_SETUP_SQL 
} from '../lib/supabase';
import { 
  getLocalAdminCredentials, 
  updateAdminCredentials, 
  clearAdminSession 
} from '../lib/auth';

interface AdminPanelProps {
  pageData: PageData;
  onUpdate: (newData: PageData) => void;
  onResetToDefault: () => void;
  onCloseAdmin: () => void;
  onLogout?: () => void;
}

export function AdminPanel({
  pageData,
  onUpdate,
  onResetToDefault,
  onCloseAdmin,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'cards' | 'support' | 'socials' | 'database' | 'security' | 'backup'>('profile');
  const [activeCardSubTab, setActiveCardSubTab] = useState<'card1' | 'card2' | 'card3' | 'card4'>('card1');
  const [savedNotice, setSavedNotice] = useState(false);

  // Admin Authentication & Credentials state
  const [adminUser, setAdminUser] = useState(() => getLocalAdminCredentials().username);
  const [newAdminUsername, setNewAdminUsername] = useState(() => getLocalAdminCredentials().username);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  // Supabase Database Connection States
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getActiveSupabaseCredentials().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getActiveSupabaseCredentials().key);
  const [dbTestState, setDbTestState] = useState<{ testing: boolean; result?: { success: boolean; message: string; tableExists: boolean } }>({ testing: false });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const showSaveSuccess = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername.trim()) {
      setSecurityStatus({ loading: false, success: false, message: 'O nome de usuário não pode ficar vazio.' });
      return;
    }
    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      setSecurityStatus({ loading: false, success: false, message: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }
    if (newAdminPassword && newAdminPassword.length < 4) {
      setSecurityStatus({ loading: false, success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    setSecurityStatus({ loading: true });
    try {
      const res = await updateAdminCredentials(newAdminUsername, newAdminPassword || undefined);
      if (res.success) {
        setAdminUser(newAdminUsername.trim());
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        setSecurityStatus({
          loading: false,
          success: true,
          message: res.isSyncedToDatabase
            ? 'Credenciais atualizadas com sucesso e sincronizadas com o banco de dados Supabase!'
            : 'Credenciais atualizadas com sucesso no armazenamento local deste navegador.',
        });
        setTimeout(() => setSecurityStatus(null), 5000);
      } else {
        setSecurityStatus({ loading: false, success: false, message: res.error || 'Falha ao atualizar credenciais.' });
      }
    } catch (err: any) {
      setSecurityStatus({ loading: false, success: false, message: err?.message || 'Erro inesperado ao salvar credenciais.' });
    }
  };

  // Helper to update top-level section
  const updateSection = <K extends keyof PageData>(key: K, val: PageData[K]) => {
    const updated = { ...pageData, [key]: val };
    onUpdate(updated);
    showSaveSuccess();
  };

  // Helper to update specific course card
  const updateCard = (cardKey: 'card1' | 'card2' | 'card3' | 'card4', newCardData: CourseCardData) => {
    const updated = { ...pageData, [cardKey]: newCardData };
    onUpdate(updated);
    showSaveSuccess();
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pageData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_pagina_vioor_${new Date().toISOString().slice(0, 10)}.json`);
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
              Personalize cada texto, foto, preço, favicon e sincronize com o Supabase
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Database Connection Pill */}
          {isSupabaseConfigured() ? (
            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Supabase configurado e sincronizando. Clique para gerenciar."
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Conectado</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold px-2.5 py-1 bg-amber-50 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Salvo localmente neste navegador. Clique para conectar ao Supabase."
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Modo Local (Clique p/ Conectar)</span>
            </button>
          )}

          {savedNotice && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 animate-fadeIn">
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

          <button
            type="button"
            onClick={() => {
              clearAdminSession();
              if (onLogout) {
                onLogout();
              } else {
                onCloseAdmin();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold border border-gray-200 transition-all cursor-pointer"
            title="Encerrar sessão de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
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
            <span>4 Cards de Cursos</span>
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
            <span>Links Redes Sociais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco de Dados (Supabase)</span>
            {isSupabaseConfigured() && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#ff4612] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Segurança & Login</span>
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

              {/* Favicon Uploader */}
              <div className="pt-2">
                <ImageUploader
                  label="Favicon / Ícone da Aba do Navegador"
                  value={pageData.faviconUrl || '/favicon.svg'}
                  defaultValue="/favicon.svg"
                  onChange={(val) => {
                    updateSection('faviconUrl', val);
                  }}
                  aspectRatio="1:1"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Ícone personalizado que aparece na aba do navegador e nos favoritos. Salvo no Supabase.
                </p>
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

              {/* Brand Favicon / Marca Pessoal Section */}
              <div className="pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Favicon da Aba & Marca Pessoal (VIOOR)
                  </label>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ativo na Aba do Navegador
                  </span>
                </div>
                
                <div className="bg-[#18191e] rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-black/60 p-1 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                      <img
                        src={pageData.faviconUrl || '/favicon.svg'}
                        alt="Favicon da Marca"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">Favicon Ativo</span>
                        <span className="text-[10px] text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono border border-amber-400/20">SVG / PNG / Web</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Ícone oficial exibido na aba do navegador, favoritos e atalhos de celular. Atualiza em tempo real.
                      </p>
                    </div>
                  </div>

                  {/* Browser Tab Simulation Preview */}
                  <div className="bg-[#282a32] px-3.5 py-2 rounded-lg flex items-center gap-2 text-[11px] text-gray-200 border border-white/10 shadow-xs">
                    <img src={pageData.faviconUrl || '/favicon.svg'} alt="Ícone da aba" className="w-4 h-4 rounded-xs shrink-0 object-contain" />
                    <span className="truncate max-w-[150px] text-[11px] text-gray-300 font-medium">
                      {pageData.profile.name} - Crie seu Futuro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: OS 4 CARDS DE CURSOS                              */}
          {/* ======================================================== */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              
              {/* Card Selector Sub-Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveCardSubTab('card1')}
                  className={`flex-1 min-w-[120px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
                  className={`flex-1 min-w-[120px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
                  className={`flex-1 min-w-[120px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCardSubTab === 'card3'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Card 3 (Roteiros)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCardSubTab('card4')}
                  className={`flex-1 min-w-[120px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCardSubTab === 'card4'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Card 4 (Edição Viral)
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
                <h3 className="text-sm font-bold text-gray-800">
                  1. Visual do Card na Página
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

              {/* Section B: Modal Details */}
              <div className="space-y-5 bg-white p-5 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800">
                  2. Informações do Modal (Ao Clicar no Card)
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
          {/* TAB 3: SUPORTE WHATSAPP (MODAL & MENSAGENS)               */}
          {/* ======================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Botão de Suporte ao Aluno (WhatsApp)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure o número de WhatsApp, horário de atendimento e os motivos de contato pré-formatados.
                </p>
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
          {/* TAB 4: REDES SOCIAIS (APENAS LINKS DIRETOS)              */}
          {/* ======================================================== */}
          {activeTab === 'socials' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Links Diretos das Redes Sociais
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ao clicar em cada botão na página, o visitante será redirecionado imediatamente para o link configurado abaixo.
                </p>
              </div>

              {/* Instagram */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white text-xs">
                    📷
                  </div>
                  <label className="text-xs font-bold text-gray-800">Link do Instagram</label>
                </div>
                <input
                  type="text"
                  placeholder="https://instagram.com/seu-perfil"
                  value={pageData.socials.instagram}
                  onChange={(e) =>
                    updateSection('socials', {
                      ...pageData.socials,
                      instagram: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                />
              </div>

              {/* YouTube */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-[#ff0000] flex items-center justify-center text-white text-xs">
                    ▶
                  </div>
                  <label className="text-xs font-bold text-gray-800">Link do YouTube</label>
                </div>
                <input
                  type="text"
                  placeholder="https://youtube.com/@seu-canal"
                  value={pageData.socials.youtube}
                  onChange={(e) =>
                    updateSection('socials', {
                      ...pageData.socials,
                      youtube: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                />
              </div>

              {/* TikTok */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-white text-xs">
                    ♪
                  </div>
                  <label className="text-xs font-bold text-gray-800">Link do TikTok</label>
                </div>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@seu-perfil"
                  value={pageData.socials.tiktok}
                  onChange={(e) =>
                    updateSection('socials', {
                      ...pageData.socials,
                      tiktok: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                />
              </div>

              {/* Facebook */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold">
                    f
                  </div>
                  <label className="text-xs font-bold text-gray-800">Link do Facebook</label>
                </div>
                <input
                  type="text"
                  placeholder="https://facebook.com/sua-pagina"
                  value={pageData.socials.facebook}
                  onChange={(e) =>
                    updateSection('socials', {
                      ...pageData.socials,
                      facebook: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: BANCO DE DADOS (SUPABASE)                         */}
          {/* ======================================================== */}
          {activeTab === 'database' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#ff4612]" />
                  <span>Sincronização em Nuvem com o Supabase</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Conecte seu banco de dados PostgreSQL do Supabase para que <strong>cada alteração</strong> feita (fotos dos cursos, favicon, textos, preços e redes sociais) fique permanentemente salva para todos os visitantes da internet.
                </p>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border text-xs ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`} />
                    <span>
                      {isSupabaseConfigured()
                        ? 'Status: Conectado ao Banco de Dados'
                        : 'Status: Modo Local Ativo (localStorage)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200">
                    Origem: {getActiveSupabaseCredentials().source === 'env' ? 'Arquivo .env' : getActiveSupabaseCredentials().source === 'storage' ? 'Painel de Controle' : 'Nenhum'}
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  {isSupabaseConfigured()
                    ? 'As alterações salvas no painel são transmitidas e guardadas em tempo real na tabela page_config (id: main) do seu Supabase.'
                    : 'Suas alterações estão salvas com segurança no seu navegador. Para que qualquer pessoa no mundo veja as mudanças, informe a URL e Chave do Supabase abaixo.'}
                </p>
              </div>

              {/* Credentials Form */}
              <div className="space-y-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Credenciais do Projeto Supabase
                  </h3>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#ff4612] hover:underline font-semibold"
                  >
                    <span>Ir para o Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    URL do Projeto (Project URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo-seu-id.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900 bg-white"
                  />
                  <p className="text-[10.5px] text-gray-500 mt-1">
                    Encontrado no Supabase em: <em>Project Settings → Configuration → Data API → Project URL</em>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Chave Pública (anon / public key)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff4612]/30 focus:border-[#ff4612] text-gray-900 bg-white"
                  />
                  <p className="text-[10.5px] text-gray-500 mt-1">
                    Encontrado em: <em>Project Settings → Configuration → Data API → anon / public</em>
                  </p>
                </div>

                {/* Database Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={dbTestState.testing}
                    onClick={async () => {
                      setDbTestState({ testing: true });
                      const res = await testSupabaseConnection(supabaseUrlInput, supabaseKeyInput);
                      setDbTestState({ testing: false, result: res });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>{dbTestState.testing ? 'Testando Conexão...' : 'Testar Conexão'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
                        alert('Preencha a URL e a Chave Anon antes de salvar.');
                        return;
                      }
                      saveCustomSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
                      setSyncStatus('Salvando credenciais e sincronizando dados da página...');
                      const saveRes = await saveRemotePageConfig(pageData);
                      if (saveRes.success) {
                        setSyncStatus('Tudo pronto! Todas as informações (incluindo o Favicon) foram salvas no Supabase!');
                        setTimeout(() => setSyncStatus(null), 4000);
                        showSaveSuccess();
                      } else {
                        setSyncStatus(`Aviso: Credenciais salvas, mas o envio retornou: ${saveRes.error}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff4612] hover:bg-[#e03a0c] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar e Sincronizar Tudo</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setSyncStatus('Carregando dados mais recentes do Supabase...');
                      const remote = await fetchRemotePageConfig();
                      if (remote) {
                        onUpdate(remote);
                        setSyncStatus('Dados atualizados com sucesso a partir do banco!');
                        setTimeout(() => setSyncStatus(null), 3000);
                        alert('Configurações puxadas do Supabase com sucesso!');
                      } else {
                        setSyncStatus('Nenhum dado encontrado no Supabase ou falha na leitura.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-300 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                    <span>Puxar do Supabase</span>
                  </button>

                  {(getActiveSupabaseCredentials().source === 'storage') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Deseja desconectar as credenciais personalizadas salvas no painel?')) {
                          clearCustomSupabaseCredentials();
                          setSupabaseUrlInput('');
                          setSupabaseKeyInput('');
                          setDbTestState({ testing: false });
                          alert('Credenciais removidas. O sistema voltou ao modo local.');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer ml-auto"
                    >
                      <span>Desconectar</span>
                    </button>
                  )}
                </div>

                {/* Test Feedback Notice */}
                {dbTestState.result && (
                  <div className={`p-3 rounded-xl border text-xs mt-2 ${
                    dbTestState.result.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {dbTestState.result.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>{dbTestState.result.success ? 'Conexão Confirmada' : 'Atenção'}</span>
                    </div>
                    <p className="mt-1 text-[11.5px]">{dbTestState.result.message}</p>
                  </div>
                )}

                {/* Sync status feedback */}
                {syncStatus && (
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-xs">
                    <p className="font-medium">{syncStatus}</p>
                  </div>
                )}
              </div>

              {/* SQL Script Guide */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#ff4612]" />
                    <h3 className="font-bold text-xs text-gray-900">
                      Script SQL do Banco (Criação de Tabela e Permissões)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                      setSqlCopied(true);
                      setTimeout(() => setSqlCopied(false), 2500);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer"
                  >
                    {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{sqlCopied ? 'Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>

                <p className="text-[11.5px] text-gray-600 leading-relaxed">
                  Caso ainda não tenha criado a tabela no seu projeto Supabase, basta copiar este código abaixo e executar no <strong>SQL Editor</strong> do Supabase:
                </p>

                <div className="relative rounded-xl bg-gray-950 p-4 font-mono text-[11px] text-gray-200 overflow-x-auto border border-gray-800 leading-relaxed select-all">
                  <pre>{SUPABASE_SETUP_SQL}</pre>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 space-y-1">
                  <span className="font-bold text-gray-800 block">Como rodar em 3 passos:</span>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Acesse seu projeto no <strong>supabase.com</strong>.</li>
                    <li>No menu lateral esquerdo, clique no ícone <strong>SQL Editor</strong> e depois em <strong>New Query</strong>.</li>
                    <li>Cole o código acima e clique no botão verde <strong>Run</strong>. A tabela estará pronta imediatamente!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: SEGURANÇA & LOGIN DO PAINEL                        */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#ff4612]" />
                  <span>Segurança & Credenciais de Acesso</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Proteja seu painel administrativo definindo um nome de usuário e senha personalizados.
                </p>
              </div>

              {/* Status Card */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#ff4612] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Usuário Atual:</p>
                    <p className="text-sm font-bold text-gray-900">{adminUser}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-500 block">Sincronização:</span>
                  {isSupabaseConfigured() ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Banco de Dados Supabase (admin_auth)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Armazenamento Local (Navegador)
                    </span>
                  )}
                </div>
              </div>

              {/* Form to update credentials */}
              <form onSubmit={handleSaveCredentials} className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-700" />
                  <span>Alterar Nome de Usuário e Senha</span>
                </h3>

                {securityStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
                      securityStatus.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {securityStatus.success ? (
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    )}
                    <span>{securityStatus.message}</span>
                  </div>
                )}

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="Ex: vioor_admin"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4612] focus:border-transparent"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Identificação que você usará para entrar no painel.
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Nova Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showPasswordFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPasswordFields ? 'Ocultar' : 'Exibir'}</span>
                    </button>
                  </div>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Digite a nova senha (deixe em branco para manter a atual)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4612] focus:border-transparent"
                  />
                </div>

                {/* Confirm Password Input */}
                {newAdminPassword && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showPasswordFields ? 'text' : 'password'}
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Repita a nova senha para confirmação"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4612] focus:border-transparent"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={securityStatus?.loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ff4612] hover:bg-[#e03d0f] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Salvar Novas Credenciais</span>
                  </button>
                </div>
              </form>

              {/* Informative Note */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
                <p className="font-bold text-gray-800">
                  🛡️ Como funciona a proteção de login:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11.5px]">
                  <li>Qualquer visitante que tente acessar a URL <code>?admin</code> verá uma tela de login moderna solicitando usuário e senha.</li>
                  <li>As senhas são protegidas com criptografia nativa SHA-256 no navegador.</li>
                  <li>Quando o Supabase estiver conectado, suas credenciais são armazenadas na nuvem na tabela <code>admin_auth</code>.</li>
                  <li>Você pode encerrar a sessão a qualquer momento clicando no botão <strong>Sair</strong> no topo direito.</li>
                </ul>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: BACKUP & PADRÕES                                  */}
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

              {/* Supabase Integration Status */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-gray-900">Integração Supabase Pronta</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    src/lib/supabase.ts
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">
                  O cliente de conexão do Supabase já está inicializado. Quando você estiver pronto para sincronizar os dados na nuvem para todos os visitantes do mundo, adicione suas credenciais no arquivo <code>.env</code>:
                </p>
                <div className="p-2.5 rounded-lg bg-gray-900 text-gray-200 font-mono text-[11px] select-all space-y-1">
                  <p>VITE_SUPABASE_URL="https://seu-projeto.supabase.co"</p>
                  <p>VITE_SUPABASE_ANON_KEY="sua-chave-anon-aqui"</p>
                </div>
                <p className="text-[11px] text-gray-500">
                  SQL para criar a tabela no Supabase SQL Editor:
                </p>
                <div className="p-2.5 rounded-lg bg-gray-100 border border-gray-200 font-mono text-[10.5px] text-gray-700 select-all overflow-x-auto">
                  <code>create table if not exists page_config ( id text primary key default 'main', data jsonb not null, updated_at timestamp with time zone default timezone('utc'::text, now()) not null );</code>
                </div>
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
                      Restaura todos os textos, imagens e preços para os dados originais da VIOOR.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja restaurar todos os dados para o padrão original da VIOOR?')) {
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
