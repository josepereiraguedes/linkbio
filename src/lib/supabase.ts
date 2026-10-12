/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PageData } from '../types/pageData';

const STORAGE_URL_KEY = 'vioor_supabase_url_v1';
const STORAGE_ANON_KEY = 'vioor_supabase_anon_key_v1';

export const SUPABASE_SETUP_SQL = `-- 1. Criar a tabela de configurações da página (com id 'main')
create table if not exists public.page_config (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar segurança em nível de linha (RLS)
alter table public.page_config enable row level security;

-- 3. Permitir leitura pública para que os visitantes vejam o conteúdo
drop policy if exists "Public read access" on public.page_config;
create policy "Public read access" on public.page_config 
  for select using (true);

-- 4. Permitir atualização pública pelo painel de administração
drop policy if exists "Public update access" on public.page_config;
create policy "Public update access" on public.page_config 
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
      storageUrl = localStorage.getItem(STORAGE_URL_KEY) || localStorage.getItem('hanah_supabase_url_v1') || '';
      storageKey = localStorage.getItem(STORAGE_ANON_KEY) || localStorage.getItem('hanah_supabase_anon_key_v1') || '';
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

/**
 * Salva ou atualiza a configuração da página no Supabase (incluindo favicon e todos os cards).
 */
export async function saveRemotePageConfig(pageData: PageData): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      error: 'Supabase não está configurado. Conecte com URL e Chave no painel ou via variáveis de ambiente.' 
    };
  }

  try {
    const { error } = await client
      .from('page_config')
      .upsert({
        id: 'main',
        data: pageData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase: Erro ao persistir dados:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase: Exceção ao persistir dados:', err);
    return { success: false, error: err?.message || 'Falha de rede ou timeout ao conectar com o Supabase' };
  }
}
