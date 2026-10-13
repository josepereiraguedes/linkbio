/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PageData } from '../types/pageData';

const STORAGE_URL_KEY = 'vioor_supabase_url_v1';
const STORAGE_ANON_KEY = 'vioor_supabase_anon_key_v1';

export const SUPABASE_SETUP_SQL = `-- ========================================================
-- 1. TABELA DE CONTEÚDO DA PÁGINA (PÚBLICA)
-- ========================================================
create table if not exists public.page_config (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.page_config enable row level security;

drop policy if exists "Public read access" on public.page_config;
create policy "Public read access" on public.page_config 
  for select using (true);

drop policy if exists "Public update access" on public.page_config;
create policy "Public update access" on public.page_config 
  for all using (true) with check (true);

-- ========================================================
-- 2. TABELA DE AUTENTICAÇÃO DO ADMINISTRADOR (VIOOR)
-- ========================================================
create table if not exists public.admin_auth (
  id text primary key default 'credentials',
  username text not null default 'admin',
  password_hash text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_auth enable row level security;

drop policy if exists "Admin auth read access" on public.admin_auth;
create policy "Admin auth read access" on public.admin_auth 
  for select using (true);

drop policy if exists "Admin auth update access" on public.admin_auth;
create policy "Admin auth update access" on public.admin_auth 
  for all using (true) with check (true);
`;

/**
 * Obtém as credenciais ativas do Supabase:
 * 1. Prioriza o que foi configurado no painel (localStorage)
 * 2. Em seguida verifica as variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 */
export function getActiveSupabaseCredentials(): { url: string; key: string; source: 'env' | 'storage' | 'none' } {
  let storageUrl = '';
  let storageKey = '';
  
  if (typeof window !== 'undefined') {
    try {
      storageUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
      storageKey = localStorage.getItem(STORAGE_ANON_KEY) || '';
    } catch (e) {
      // Ignora erro de localStorage
    }
  }

  if (storageUrl && storageKey) {
    return { url: storageUrl.trim(), key: storageKey.trim(), source: 'storage' };
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (
    envUrl && 
    envKey && 
    !envUrl.includes('your-project') && 
    !envKey.includes('your-anon-key')
  ) {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }

  return { url: '', key: '', source: 'none' };
}

export function saveCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (!url.trim() && !key.trim()) {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_ANON_KEY);
    } else {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
      localStorage.setItem(STORAGE_ANON_KEY, key.trim());
    }
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

/**
 * Cria ou recupera a instância do cliente Supabase
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getActiveSupabaseCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('Erro ao inicializar Supabase:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getActiveSupabaseCredentials();
  return Boolean(url && key);
}

/**
 * Testa a conexão com o Supabase e verifica se a tabela page_config existe
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
}> {
  const url = customUrl || getActiveSupabaseCredentials().url;
  const key = customKey || getActiveSupabaseCredentials().key;

  if (!url || !key) {
    return {
      success: false,
      message: 'URL do projeto ou Chave Anon não foram informadas.',
      tableExists: false,
    };
  }

  try {
    const testClient = createClient(url, key, { auth: { persistSession: false } });
    
    // Tenta consultar a tabela page_config
    const { data, error } = await testClient
      .from('page_config')
      .select('id, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
        return {
          success: false,
          message: 'Conectou ao Supabase, mas a tabela "page_config" ainda não foi criada. Execute o SQL de configuração no Supabase SQL Editor.',
          tableExists: false,
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message} (Código: ${error.code || 'N/A'})`,
        tableExists: false,
      };
    }

    return {
      success: true,
      message: data 
        ? 'Conexão bem-sucedida! Tabela "page_config" encontrada e dados carregados.' 
        : 'Conexão bem-sucedida! Tabela "page_config" pronta para receber o primeiro salvamento.',
      tableExists: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na conexão: ${err?.message || 'Verifique se a URL e a Chave Anon estão corretas.'}`,
      tableExists: false,
    };
  }
}

/**
 * Busca a configuração da página salva no Supabase.
 */
export async function fetchRemotePageConfig(): Promise<PageData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('page_config')
      .select('data')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Supabase: Erro ao buscar configuração:', error.message);
      return null;
    }

    if (data?.data) {
      return data.data as PageData;
    }
  } catch (err) {
    console.warn('Supabase: Erro inesperado ao buscar dados:', err);
  }

  return null;
}

// Concurrency control & Debouncing queue
let isSavingInProgress = false;
let queuedPageData: PageData | null = null;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

async function executeUpsert(
  pageData: PageData,
  retryCount = 0
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase não está configurado. Conecte com URL e Chave no painel ou via variáveis de ambiente.',
    };
  }

  isSavingInProgress = true;

  try {
    const { error } = await client
      .from('page_config')
      .upsert(
        {
          id: 'main',
          data: pageData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      // Error code 57014 = statement timeout (due to lock contention or network pause)
      if (error.code === '57014' && retryCount < 2) {
        console.warn(
          `Supabase: Timeout transitório detectado (57014). Reenviando em 1.2s... (tentativa ${retryCount + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 400));
        return executeUpsert(queuedPageData || pageData, retryCount + 1);
      }

      console.warn('Supabase: Aviso ao persistir dados:', error.message || error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    if (retryCount < 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return executeUpsert(queuedPageData || pageData, retryCount + 1);
    }
    console.warn('Supabase: Exceção na persistência:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Falha transitória na conexão com o banco',
    };
  } finally {
    isSavingInProgress = false;

    // If another update arrived while the current one was processing, execute the latest
    if (queuedPageData) {
      const nextData = queuedPageData;
      queuedPageData = null;
      // Slight delay to release any Postgres transaction lock cleanly
      setTimeout(() => {
        executeUpsert(nextData);
      }, 150);
    }
  }
}

/**
 * Salva ou atualiza a configuração da página no Supabase de forma segura,
 * com fila de concorrência e debounce para evitar timeouts por sobrecarga (código 57014).
 */
export async function saveRemotePageConfig(
  pageData: PageData,
  immediate = false
): Promise<{ success: boolean; error?: string }> {
  // If an immediate save is requested (e.g. user clicked Save/Reset button)
  if (immediate) {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = null;
    }
    queuedPageData = null;
    return executeUpsert(pageData);
  }

  // Otherwise, debounce frequent inputs (typing, sliders) to coalesce rapid queries
  queuedPageData = pageData;

  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }

  return new Promise((resolve) => {
    saveDebounceTimer = setTimeout(async () => {
      saveDebounceTimer = null;
      if (!isSavingInProgress && queuedPageData) {
        const dataToSave = queuedPageData;
        queuedPageData = null;
        const result = await executeUpsert(dataToSave);
        resolve(result);
      } else {
        resolve({ success: true });
      }
    }, 450);
  });
}
