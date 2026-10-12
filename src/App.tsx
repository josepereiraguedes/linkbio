/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  X, 
  BookOpen, 
  ShieldCheck, 
  Share2, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  Flame,
  Settings,
  Edit3
} from 'lucide-react';

import { PageData, CourseCardData } from './types/pageData';
import { defaultPageData } from './data/defaultPageData';
import { AdminPanel } from './components/AdminPanel';

const STORAGE_KEY = 'hanah_franklin_page_data_v1';

export default function App() {
  // Page Data State (with localStorage persistence)
  const [pageData, setPageData] = useState<PageData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all required fields exist by merging with default
        return {
          ...defaultPageData,
          ...parsed,
          profile: { ...defaultPageData.profile, ...parsed.profile },
          card1: { ...defaultPageData.card1, ...parsed.card1 },
          card2: { ...defaultPageData.card2, ...parsed.card2 },
          card3: { ...defaultPageData.card3, ...parsed.card3 },
          support: { ...defaultPageData.support, ...parsed.support },
          socials: { ...defaultPageData.socials, ...parsed.socials },
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
    return defaultPageData;
  });

  // Admin View State based on URL (?admin, ?admim, #admin, #admim, /admin, /admim)
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const url = window.location.href.toLowerCase();
    return url.includes('admin') || url.includes('admim');
  });

  // Listen to URL changes
  useEffect(() => {
    const checkAdminFromUrl = () => {
      const url = window.location.href.toLowerCase();
      setIsAdminView(url.includes('admin') || url.includes('admim'));
    };

    window.addEventListener('popstate', checkAdminFromUrl);
    window.addEventListener('hashchange', checkAdminFromUrl);
    return () => {
      window.removeEventListener('popstate', checkAdminFromUrl);
      window.removeEventListener('hashchange', checkAdminFromUrl);
    };
  }, []);

  // Update & persist Page Data
  const handleUpdatePageData = (newData: PageData) => {
    setPageData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    setPageData(defaultPageData);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Falha ao limpar localStorage:', e);
    }
  };

  // Switch to admin view
  const openAdmin = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('admin', 'true');
    window.history.pushState({}, '', url.toString());
    setIsAdminView(true);
  };

  // Close admin view
  const closeAdmin = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.searchParams.delete('admim');
    if (url.hash.includes('admin') || url.hash.includes('admim')) {
      url.hash = '';
    }
    window.history.pushState({}, '', url.toString());
    setIsAdminView(false);
  };

  // Modal State in Public View
  const [activeModal, setActiveModal] = useState<'card1' | 'card2' | 'card3' | 'support' | 'social' | null>(null);
  const [selectedSocial, setSelectedSocial] = useState<'instagram' | 'youtube' | 'tiktok'>('instagram');
  const [supportIssue, setSupportIssue] = useState<string>('acesso');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const openWhatsApp = () => {
    const selectedReason = pageData.support.reasons.find((r) => r.id === supportIssue);
    const msgText = selectedReason?.message || 'Olá equipe de suporte da Hanah Franklin! Preciso de ajuda.';
    const encodedText = encodeURIComponent(msgText);
    const phone = pageData.support.whatsappNumber.replace(/\D/g, '') || '5511999999999';
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  // Helper to render course modal
  const renderCourseModal = (card: CourseCardData) => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-8 border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="notebook-grid p-6 pt-8 border-b border-amber-900/10 flex items-center gap-4">
          <img
            src={card.coverImage}
            alt={card.modalTitle}
            className="w-22 h-30 object-cover rounded-xl shadow-md border border-white shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultPageData.card1.coverImage;
            }}
          />
          <div>
            <span 
              className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1"
              style={{ color: card.badgeColor, backgroundColor: `${card.badgeColor}18` }}
            >
              {card.modalTag}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">
              {card.modalTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {card.modalSubtitle}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span>{card.modalStats}</span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2.5">
              {card.learningTitle}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
              {card.learningItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 
                    className="w-4 h-4 shrink-0 mt-0.5" 
                    style={{ color: card.badgeColor }}
                  />
                  <span>
                    <strong>{item.title} </strong>{item.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Perks */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="bg-orange-50/80 rounded-2xl p-3.5 border border-orange-200/50">
              <BookOpen className="w-5 h-5 mb-1.5" style={{ color: card.badgeColor }} />
              <p className="text-xs sm:text-sm font-bold text-gray-900">{card.perk1Title}</p>
              <p className="text-[11px] text-gray-600">{card.perk1Desc}</p>
            </div>
            <div className="bg-orange-50/80 rounded-2xl p-3.5 border border-orange-200/50">
              <ShieldCheck className="w-5 h-5 mb-1.5" style={{ color: card.badgeColor }} />
              <p className="text-xs sm:text-sm font-bold text-gray-900">{card.perk2Title}</p>
              <p className="text-[11px] text-gray-600">{card.perk2Desc}</p>
            </div>
          </div>

          {/* Offer Box */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 text-center">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
              {card.offerBadge}
            </p>
            <div className="mt-1 flex items-baseline justify-center gap-2">
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {card.originalPrice}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-gray-950">
                {card.installmentPrice}
              </span>
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: card.badgeColor }}>
              {card.cashPrice}
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={() => {
              if (card.checkoutUrl) {
                window.open(card.checkoutUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: card.badgeColor }}
          >
            <span>{card.checkoutButtonText}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );

  // If Admin View is active, render the integrated Admin Panel!
  if (isAdminView) {
    return (
      <AdminPanel
        pageData={pageData}
        onUpdate={handleUpdatePageData}
        onResetToDefault={handleResetToDefault}
        onCloseAdmin={closeAdmin}
      />
    );
  }

  // Otherwise, render the Public Page View
  return (
    <div className="min-h-screen w-full bg-[#edece8] flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 lg:p-14 selection:bg-[#ff4612]/20 selection:text-[#ff4612] relative overflow-x-hidden">
      
      {/* Top Floating Buttons: Share + Quick Admin Shortcut */}
      <header className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10 flex items-center gap-2.5">
        
        {/* Quick Edit/Admin Trigger Button */}
        <button
          onClick={openAdmin}
          title="Abrir Painel de Edição (?admin)"
          aria-label="Abrir Painel de Edição"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 text-xs font-semibold shadow-xs border border-gray-200/70 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#ff4612]" />
          <span>Editar Página</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          aria-label="Compartilhar página"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 text-xs font-medium shadow-xs border border-gray-200/70 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Link Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Compartilhar</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container - Desktop side-by-side & Mobile stacked */}
      <main className="w-full max-w-[1260px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-14 py-6 sm:py-10">
        
        {/* Left Column: Profile Info */}
        <section className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 w-full max-w-[340px]">
          
          {/* Circular Avatar */}
          <div className="relative group cursor-pointer" onClick={() => setActiveModal('card1')}>
            <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden shadow-sm border-[4px] border-white/90 bg-emerald-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-102">
              <img
                src={pageData.profile.avatarUrl}
                alt={pageData.profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultPageData.profile.avatarUrl;
                }}
              />
            </div>
            {/* Verification badge */}
            <div className="absolute bottom-1.5 right-2.5 bg-white rounded-full p-1 shadow-xs border border-gray-100">
              <div className="w-5 h-5 rounded-full bg-[#ff4612] flex items-center justify-center text-white text-[11px] font-bold">
                ✓
              </div>
            </div>
          </div>

          {/* Name */}
          <h1 className="mt-6 text-[30px] sm:text-[34px] md:text-[38px] font-extrabold tracking-tight text-gray-950 leading-none">
            {pageData.profile.name}
          </h1>

          {/* Bio Description */}
          <div className="mt-3 text-[14.5px] sm:text-[15.5px] md:text-[16px] text-gray-600 leading-relaxed max-w-[300px] sm:max-w-[320px]">
            <p className="font-medium text-gray-700">{pageData.profile.bioHeading}</p>
            <p className="mt-1">{pageData.profile.bioBody}</p>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-5 flex items-center gap-3.5 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1.5 font-semibold text-gray-800">
              <TrendingUp className="w-4 h-4 text-[#ff4612]" /> {pageData.profile.stat1}
            </span>
            <span aria-hidden="true" className="text-gray-300">·</span>
            <span className="flex items-center gap-1.5 font-medium text-gray-600">
              <Flame className="w-4 h-4 text-amber-500" /> {pageData.profile.stat2}
            </span>
          </div>
        </section>

        {/* Right Section: 4 Cards (Grid 2x2 on desktop, single column on mobile) + Social Buttons right-aligned */}
        <section className="w-full max-w-[850px] lg:max-w-[880px] flex flex-col">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            
            {/* 1º CARD: Método para Viralização (Portuguese) */}
            <article 
              onClick={() => setActiveModal('card1')}
              className="notebook-grid rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-amber-900/10 cursor-pointer flex justify-between items-center group relative overflow-hidden"
            >
              <div className="flex flex-col justify-between h-full pr-3 sm:pr-4 flex-1 min-w-0">
                <div>
                  <span 
                    className="inline-block text-[11.5px] sm:text-[12.5px] font-semibold px-3 py-0.5 rounded-full bg-white/75 backdrop-blur-xs mb-3 border"
                    style={{ borderColor: `${pageData.card1.badgeColor}bf`, color: pageData.card1.badgeColor }}
                  >
                    {pageData.card1.badge}
                  </span>
                  
                  {/* Main Copy (3 lines) */}
                  <p className="text-[13.5px] sm:text-[14px] md:text-[14.5px] text-gray-800 leading-[1.38]">
                    {pageData.card1.line1}<br className="hidden sm:inline" />
                    {' '}{pageData.card1.line2Prefix}<strong className="font-bold text-gray-950">{pageData.card1.line2Bold}</strong><br className="hidden sm:inline" />
                    {' '}<strong className="font-bold text-gray-950">{pageData.card1.line3Bold}</strong>{pageData.card1.line3Suffix}
                  </p>
                </div>

                <div className="mt-4 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('card1');
                    }}
                    className="text-white text-[13px] sm:text-[13.5px] font-bold px-5 py-2 rounded-full shadow-xs hover:shadow transition-all duration-200 inline-flex items-center gap-1 group-hover:scale-103 cursor-pointer"
                    style={{ backgroundColor: pageData.card1.badgeColor }}
                  >
                    {pageData.card1.buttonText}
                  </button>
                </div>
              </div>

              {/* Cover Mockup */}
              <div className="w-[96px] sm:w-[110px] md:w-[118px] h-[138px] sm:h-[156px] md:h-[168px] rounded-2xl overflow-hidden shadow-md border border-white/70 shrink-0 bg-orange-100 transition-transform duration-300 group-hover:scale-102">
                <img
                  src={pageData.card1.coverImage}
                  alt={pageData.card1.modalTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultPageData.card1.coverImage;
                  }}
                />
              </div>
            </article>

            {/* 2º CARD: Método viral - Español */}
            <article 
              onClick={() => setActiveModal('card2')}
              className="notebook-grid rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-emerald-950/10 cursor-pointer flex justify-between items-center group relative overflow-hidden"
            >
              <div className="flex flex-col justify-between h-full pr-3 sm:pr-4 flex-1 min-w-0">
                <div>
                  <span 
                    className="inline-block text-[11.5px] sm:text-[12.5px] font-semibold px-3 py-0.5 rounded-full bg-white/75 backdrop-blur-xs mb-3 border"
                    style={{ borderColor: `${pageData.card2.badgeColor}bf`, color: pageData.card2.badgeColor }}
                  >
                    {pageData.card2.badge}
                  </span>
                  
                  {/* Main Copy (3 lines) */}
                  <p className="text-[13.5px] sm:text-[14px] md:text-[14.5px] text-gray-800 leading-[1.38]">
                    {pageData.card2.line1}<br className="hidden sm:inline" />
                    {' '}{pageData.card2.line2Prefix}<strong className="font-bold text-gray-950">{pageData.card2.line2Bold}</strong><br className="hidden sm:inline" />
                    {' '}<strong className="font-bold text-gray-950">{pageData.card2.line3Bold}</strong>{pageData.card2.line3Suffix}
                  </p>
                </div>

                <div className="mt-4 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('card2');
                    }}
                    className="text-white text-[13px] sm:text-[13.5px] font-bold px-5 py-2 rounded-full shadow-xs hover:shadow transition-all duration-200 inline-flex items-center gap-1 group-hover:scale-103 cursor-pointer"
                    style={{ backgroundColor: pageData.card2.badgeColor }}
                  >
                    {pageData.card2.buttonText}
                  </button>
                </div>
              </div>

              {/* Cover Mockup */}
              <div className="w-[96px] sm:w-[110px] md:w-[118px] h-[138px] sm:h-[156px] md:h-[168px] rounded-2xl overflow-hidden shadow-md border border-white/70 shrink-0 bg-emerald-100 transition-transform duration-300 group-hover:scale-102">
                <img
                  src={pageData.card2.coverImage}
                  alt={pageData.card2.modalTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultPageData.card2.coverImage;
                  }}
                />
              </div>
            </article>

            {/* 3º CARD: Pack de Roteiros Magnéticos */}
            <article 
              onClick={() => setActiveModal('card3')}
              className="notebook-grid rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-purple-950/10 cursor-pointer flex justify-between items-center group relative overflow-hidden"
            >
              <div className="flex flex-col justify-between h-full pr-3 sm:pr-4 flex-1 min-w-0">
                <div>
                  <span 
                    className="inline-block text-[11.5px] sm:text-[12.5px] font-semibold px-3 py-0.5 rounded-full bg-white/75 backdrop-blur-xs mb-3 border"
                    style={{ borderColor: `${pageData.card3.badgeColor}bf`, color: pageData.card3.badgeColor }}
                  >
                    {pageData.card3.badge}
                  </span>
                  
                  {/* Main Copy (3 lines) */}
                  <p className="text-[13.5px] sm:text-[14px] md:text-[14.5px] text-gray-800 leading-[1.38]">
                    {pageData.card3.line1}<br className="hidden sm:inline" />
                    {' '}{pageData.card3.line2Prefix}<strong className="font-bold text-gray-950">{pageData.card3.line2Bold}</strong><br className="hidden sm:inline" />
                    {' '}<strong className="font-bold text-gray-950">{pageData.card3.line3Bold}</strong>{pageData.card3.line3Suffix}
                  </p>
                </div>

                <div className="mt-4 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('card3');
                    }}
                    className="text-white text-[13px] sm:text-[13.5px] font-bold px-5 py-2 rounded-full shadow-xs hover:shadow transition-all duration-200 inline-flex items-center gap-1 group-hover:scale-103 cursor-pointer"
                    style={{ backgroundColor: pageData.card3.badgeColor }}
                  >
                    {pageData.card3.buttonText}
                  </button>
                </div>
              </div>

              {/* Cover Mockup */}
              <div className="w-[96px] sm:w-[110px] md:w-[118px] h-[138px] sm:h-[156px] md:h-[168px] rounded-2xl overflow-hidden shadow-md border border-white/70 shrink-0 bg-purple-100 transition-transform duration-300 group-hover:scale-102">
                <img
                  src={pageData.card3.coverImage}
                  alt={pageData.card3.modalTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultPageData.card3.coverImage;
                  }}
                />
              </div>
            </article>

            {/* 4º CARD: Suporte aos Alunos (4º lugar, último no celular) */}
            <article 
              onClick={() => setActiveModal('support')}
              className="bg-[#e8f7e3] rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-emerald-700/10 cursor-pointer flex flex-col justify-between group min-h-[142px] sm:min-h-[152px]"
            >
              <div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs group-hover:scale-108 transition-transform duration-200">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.95-.4-4.22-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.19 8.19 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.82c.01 4.54-3.68 8.24-8.22 8.24zm4.51-6.17c-.25-.12-1.46-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/>
                  </svg>
                </div>

                <h2 className="font-bold text-gray-950 text-[16px] sm:text-[17.5px] mt-3">
                  {pageData.support.title}
                </h2>
                
                <p className="text-[12.5px] sm:text-[13.5px] text-gray-600 mt-1">
                  {pageData.support.subtitle}
                </p>
              </div>

              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-800 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{pageData.support.linkText}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </article>

          </div>

          {/* SOCIAL MEDIA BUTTONS - Aligned to the RIGHT */}
          <div className="w-full flex justify-end items-center gap-3.5 mt-5 sm:mt-6 pr-1">
            
            {/* Instagram Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedSocial('instagram');
                setActiveModal('social');
              }}
              title="Instagram"
              aria-label="Instagram"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>

            {/* YouTube Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedSocial('youtube');
                setActiveModal('social');
              }}
              title="YouTube"
              aria-label="YouTube"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#ff0000] flex items-center justify-center text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </button>

            {/* TikTok Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedSocial('tiktok');
                setActiveModal('social');
              }}
              title="TikTok"
              aria-label="TikTok"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-gray-200/90 flex items-center justify-center text-black shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-black">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.19 1.19 2.14 2.37 2.37.77.16 1.59.08 2.28-.27.8-.39 1.37-1.14 1.55-2.01.07-.37.09-.76.09-1.14l-.02-13.91z"/>
              </svg>
            </button>

          </div>

        </section>

      </main>

      {/* ======================================================== */}
      {/* RENDER MODAL ACCORDING TO ACTIVE STATE                   */}
      {/* ======================================================== */}
      {activeModal === 'card1' && renderCourseModal(pageData.card1)}
      {activeModal === 'card2' && renderCourseModal(pageData.card2)}
      {activeModal === 'card3' && renderCourseModal(pageData.card3)}

      {/* MODAL SUPORTE (WHATSAPP) */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-gray-100">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-[#e8f7e3] p-6 text-center border-b border-emerald-700/10">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md mx-auto mb-3">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.95-.4-4.22-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.19 8.19 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.82c.01 4.54-3.68 8.24-8.22 8.24zm4.51-6.17c-.25-.12-1.46-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {pageData.support.modalTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xs mx-auto">
                {pageData.support.modalSubtitle}
              </p>
            </div>

            {/* Selection */}
            <div className="p-6 space-y-4">
              <label className="block text-xs sm:text-sm font-bold text-gray-700">
                Selecione o motivo do seu contato:
              </label>
              
              <div className="space-y-2">
                {pageData.support.reasons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSupportIssue(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                      supportIssue === item.id 
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 shadow-xs' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    {supportIssue === item.id && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={openWhatsApp}
                className="w-full mt-4 py-3 sm:py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Chamar no WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL REDES SOCIAIS */}
      {activeModal === 'social' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative border border-gray-100 p-6">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="text-center pt-2">
              <div className="w-18 h-18 rounded-full overflow-hidden mx-auto border-2 border-white shadow-md">
                <img
                  src={pageData.profile.avatarUrl}
                  alt={pageData.profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultPageData.profile.avatarUrl;
                  }}
                />
              </div>
              <h3 className="font-bold text-gray-900 mt-3 text-lg sm:text-xl">{pageData.profile.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{pageData.socials[selectedSocial].username}</p>
            </div>

            {/* Tabs for Socials */}
            <div className="flex items-center justify-center gap-2 mt-5 bg-gray-100 p-1.5 rounded-xl">
              <button
                onClick={() => setSelectedSocial('instagram')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedSocial === 'instagram' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Instagram
              </button>
              <button
                onClick={() => setSelectedSocial('youtube')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedSocial === 'youtube' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                YouTube
              </button>
              <button
                onClick={() => setSelectedSocial('tiktok')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedSocial === 'tiktok' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                TikTok
              </button>
            </div>

            {/* Dynamic Social Body */}
            <div className="mt-5 text-center">
              {selectedSocial === 'instagram' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-tr from-[#f09433]/10 via-[#dc2743]/10 to-[#bc1888]/10 p-4 rounded-2xl border border-pink-200/50">
                    <p className="text-2xl sm:text-3xl font-black text-gray-900">
                      {pageData.socials.instagram.followers}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      {pageData.socials.instagram.followersLabel}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {pageData.socials.instagram.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (pageData.socials.instagram.url) {
                        window.open(pageData.socials.instagram.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-xs sm:text-sm shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{pageData.socials.instagram.buttonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedSocial === 'youtube' && (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-200/50">
                    <p className="text-2xl sm:text-3xl font-black text-gray-900">
                      {pageData.socials.youtube.followers}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      {pageData.socials.youtube.followersLabel}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {pageData.socials.youtube.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (pageData.socials.youtube.url) {
                        window.open(pageData.socials.youtube.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-[#ff0000] text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-[#e60000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{pageData.socials.youtube.buttonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedSocial === 'tiktok' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <p className="text-2xl sm:text-3xl font-black text-gray-900">
                      {pageData.socials.tiktok.followers}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      {pageData.socials.tiktok.followersLabel}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {pageData.socials.tiktok.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (pageData.socials.tiktok.url) {
                        window.open(pageData.socials.tiktok.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-black text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{pageData.socials.tiktok.buttonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
