/**
 * Supabase client configuration for VeganFlemme
 * Supports both production URL and proxy Amazon URL
 */

// Environment variables for Supabase URLs
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASEAPIPA8_URL = process.env.NEXT_PUBLIC_SUPABASEAPIPA8_URL
const SUPABASEAPIPA8_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASEAPIPA8_ANON_KEY

export interface SupabaseConfig {
  url: string
  anonKey: string
}

/**
 * Get Supabase configuration for production environment
 */
export const getSupabaseConfig = (): SupabaseConfig | null => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('Supabase production configuration missing')
    }
    return null
  }

  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  }
}

/**
 * Get Supabase configuration for Amazon proxy
 */
export const getSupabaseProxyConfig = (): SupabaseConfig | null => {
  if (!SUPABASEAPIPA8_URL || !SUPABASEAPIPA8_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('Supabase proxy (Amazon) configuration missing')
    }
    return null
  }

  return {
    url: SUPABASEAPIPA8_URL,
    anonKey: SUPABASEAPIPA8_ANON_KEY,
  }
}

/**
 * Get the active Supabase configuration based on environment
 * Prefers proxy in production for better performance
 */
export const getActiveSupabaseConfig = (): SupabaseConfig | null => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // In production, prefer the proxy URL if available
  if (isProduction) {
    const proxyConfig = getSupabaseProxyConfig()
    if (proxyConfig) {
      return proxyConfig
    }
  }
  
  // Fall back to main Supabase URL
  return getSupabaseConfig()
}

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return getActiveSupabaseConfig() !== null
}

// Re-export for convenience
export { SUPABASE_URL, SUPABASEAPIPA8_URL }