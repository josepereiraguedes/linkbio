/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowLeft, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { verifyAdminCredentials, setAdminSession } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await verifyAdminCredentials(username, password);
      if (result.success) {
        setAdminSession(rememberMe);
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || 'Usuário ou senha incorretos.');
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro ao verificar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edece8] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#ff4612]/20 selection:text-[#ff4612]">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200/80 overflow-hidden animate-fade-slide-up">
        
        {/* Top Header with VIOOR Logo */}
        <div className="bg-gradient-to-b from-[#1c1c1f] to-[#121214] text-white p-7 text-center relative border-b border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-5 left-5 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-2 mx-auto mb-3 flex items-center justify-center shadow-inner">
            <img 
              src="/favicon.svg" 
              alt="VIOOR Brand Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback to lock icon if svg failed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Painel Administrativo
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            VIOOR Agência · Acesso exclusivo para o proprietário
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {/* Status Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                autoComplete="username"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4612] focus:border-transparent transition-all disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4612] focus:border-transparent transition-all disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Helper */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#ff4612] focus:ring-[#ff4612] cursor-pointer"
              />
              <span>Manter conectado</span>
            </label>

            {isSupabaseConfigured() && (
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Supabase
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#ff4612] hover:bg-[#e03d0f] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciais...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Entrar no Painel</span>
              </>
            )}
          </button>

          {/* Initial Access Hint */}
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 leading-relaxed text-center">
            <p className="font-semibold text-amber-900">
              🔑 Credenciais padrão iniciais:
            </p>
            <p className="mt-0.5">
              Usuário: <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold">admin</code> · Senha: <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold">admin</code>
            </p>
            <p className="text-[10px] text-amber-700 mt-1">
              (Você pode alterar seu usuário e senha dentro do painel a qualquer momento)
            </p>
          </div>

        </form>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            ← Voltar para a página pública
          </button>
        </div>

      </div>
    </div>
  );
}
