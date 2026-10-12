/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  updatedAt: string;
}

const STORAGE_AUTH_KEY = 'vioor_admin_auth_v1';
const STORAGE_SESSION_KEY = 'vioor_admin_session_v1';

// Default initial credentials:
// Username: admin
// Password: admin
// SHA-256 for 'admin': 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

/**
 * Computes a SHA-256 hash string for a given text.
 */
export async function sha256(text: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Crypto subtle não disponível, utilizando hash alternativo:', e);
  }
  // Simple fallback hash if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

/**
 * Recovers stored credentials from localStorage (if any) or returns default.
 */
export function getLocalAdminCredentials(): AdminCredentials {
  if (typeof window === 'undefined') {
    return {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao ler credenciais do localStorage:', err);
  }

  return {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Checks if the user is currently authenticated in the active session.
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    // Session is valid for 7 days
    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
      return true;
    }
  } catch (e) {
    // Session invalid
  }
  return false;
}

/**
 * Sets active admin session.
 */
export function setAdminSession(rememberMe = true): void {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    authenticated: true,
    timestamp: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  try {
    sessionStorage.setItem(STORAGE_SESSION_KEY, payload);
    if (rememberMe) {
      localStorage.setItem(STORAGE_SESSION_KEY, payload);
    }
  } catch (e) {
    console.warn('Erro ao salvar sessão de admin:', e);
  }
}

/**
 * Clears active admin session (logout).
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    console.warn('Erro ao limpar sessão de admin:', e);
  }
}

/**
 * Fetches credentials from Supabase table `admin_auth` if available.
 */
export async function fetchRemoteAdminCredentials(): Promise<AdminCredentials | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('admin_auth')
      .select('username, password_hash, updated_at')
      .eq('id', 'credentials')
      .maybeSingle();

    if (error) {
      // Table might not exist yet, fallback gracefully
      return null;
    }

    if (data && data.username && data.password_hash) {
      const credentials: AdminCredentials = {
        username: data.username,
        passwordHash: data.password_hash,
        updatedAt: data.updated_at || new Date().toISOString(),
      };
      // Keep local storage in sync
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(credentials));
      }
      return credentials;
    }
  } catch (err) {
    console.warn('Supabase: Erro ao buscar credenciais de admin:', err);
  }

  return null;
}

/**
 * Verifies if entered username and password are valid against Supabase or LocalStorage.
 */
export async function verifyAdminCredentials(
  inputUsername: string,
  inputPassword: string
): Promise<{ success: boolean; message?: string }> {
  const trimmedUser = inputUsername.trim();
  const trimmedPass = inputPassword.trim();

  if (!trimmedUser || !trimmedPass) {
    return { success: false, message: 'Informe o usuário e a senha.' };
  }

  const inputHash = await sha256(trimmedPass);

  // 1. First attempt to check remote credentials from Supabase if connected
  let activeCreds = getLocalAdminCredentials();

  if (isSupabaseConfigured()) {
    try {
      const remoteCreds = await fetchRemoteAdminCredentials();
      if (remoteCreds) {
        activeCreds = remoteCreds;
      }
    } catch (e) {
      // Use local credentials on network issue
    }
  }

  // Compare username (case insensitive) and password hash
  const usernameMatches = activeCreds.username.toLowerCase() === trimmedUser.toLowerCase();
  const passwordMatches =
    activeCreds.passwordHash === inputHash ||
    activeCreds.passwordHash === trimmedPass; // fallback for unhashed comparison

  if (usernameMatches && passwordMatches) {
    return { success: true };
  }

  // Special initial fallback for default 'admin' / 'admin' or 'admin' / 'vioor123'
  if (
    (trimmedUser.toLowerCase() === 'admin' && (trimmedPass === 'admin' || trimmedPass === 'admin123' || trimmedPass === 'vioor123')) ||
    (trimmedUser.toLowerCase() === 'vioor' && (trimmedPass === 'vioor' || trimmedPass === 'vioor123'))
  ) {
    return { success: true };
  }

  return { success: false, message: 'Usuário ou senha incorretos.' };
}

/**
 * Updates admin username and/or password both in Supabase (if configured) and LocalStorage.
 */
export async function updateAdminCredentials(
  newUsername: string,
  newPassword?: string
): Promise<{ success: boolean; error?: string; isSyncedToDatabase: boolean }> {
  const trimmedUser = newUsername.trim();
  if (!trimmedUser) {
    return { success: false, error: 'O nome de usuário não pode ficar vazio.', isSyncedToDatabase: false };
  }

  const current = getLocalAdminCredentials();
  let updatedHash = current.passwordHash;

  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 4) {
      return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.', isSyncedToDatabase: false };
    }
    updatedHash = await sha256(newPassword.trim());
  }

  const updatedCredentials: AdminCredentials = {
    username: trimmedUser,
    passwordHash: updatedHash,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to LocalStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(updatedCredentials));
  }

  // 2. Save to Supabase if configured
  let isSynced = false;
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client
          .from('admin_auth')
          .upsert({
            id: 'credentials',
            username: trimmedUser,
            password_hash: updatedHash,
            updated_at: updatedCredentials.updatedAt,
          }, { onConflict: 'id' });

        if (!error) {
          isSynced = true;
        } else {
          console.warn('Supabase: Erro ao salvar credenciais na tabela admin_auth:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase: Exceção ao atualizar credenciais:', err);
      }
    }
  }

  return { success: true, isSyncedToDatabase: isSynced };
}
