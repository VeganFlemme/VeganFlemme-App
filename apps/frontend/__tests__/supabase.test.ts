/**
 * @jest-environment jsdom
 */

// Mock the environment variables
const mockEnvVars: Record<string, string> = {}

jest.mock('../src/lib/supabase', () => {
  const originalModule = jest.requireActual('../src/lib/supabase')
  
  const getSupabaseConfig = () => {
    const SUPABASE_URL = mockEnvVars.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON_KEY = mockEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null
    }

    return {
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
    }
  }

  const getSupabaseProxyConfig = () => {
    const SUPABASEAPIPA8_URL = mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_URL
    const SUPABASEAPIPA8_ANON_KEY = mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_ANON_KEY
    
    if (!SUPABASEAPIPA8_URL || !SUPABASEAPIPA8_ANON_KEY) {
      return null
    }

    return {
      url: SUPABASEAPIPA8_URL,
      anonKey: SUPABASEAPIPA8_ANON_KEY,
    }
  }

  const getActiveSupabaseConfig = () => {
    const isProduction = mockEnvVars.NODE_ENV === 'production'
    
    if (isProduction) {
      const proxyConfig = getSupabaseProxyConfig()
      if (proxyConfig) {
        return proxyConfig
      }
    }
    
    return getSupabaseConfig()
  }

  const isSupabaseConfigured = () => {
    return getActiveSupabaseConfig() !== null
  }
  
  return {
    ...originalModule,
    getSupabaseConfig,
    getSupabaseProxyConfig,
    getActiveSupabaseConfig,
    isSupabaseConfigured
  }
})

import { 
  getSupabaseConfig, 
  getSupabaseProxyConfig,
  getActiveSupabaseConfig,
  isSupabaseConfigured 
} from '../src/lib/supabase'

describe('Supabase Configuration', () => {
  beforeEach(() => {
    // Clear mock environment variables
    Object.keys(mockEnvVars).forEach(key => delete mockEnvVars[key])
  })

  describe('getSupabaseConfig', () => {
    it('should return null when URL or key is missing', () => {
      expect(getSupabaseConfig()).toBeNull()
    })

    it('should return config when URL and key are provided', () => {
      mockEnvVars.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      
      const config = getSupabaseConfig()
      expect(config).toEqual({
        url: 'https://test.supabase.co',
        anonKey: 'test-key'
      })
    })
  })

  describe('getSupabaseProxyConfig', () => {
    it('should return null when URL or key is missing', () => {
      expect(getSupabaseProxyConfig()).toBeNull()
    })

    it('should return config when URL and key are provided', () => {
      mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_URL = 'https://api.amazonaws.com'
      mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_ANON_KEY = 'proxy-key'
      
      const config = getSupabaseProxyConfig()
      expect(config).toEqual({
        url: 'https://api.amazonaws.com',
        anonKey: 'proxy-key'
      })
    })
  })

  describe('getActiveSupabaseConfig', () => {
    it('should prefer proxy config in production', () => {
      mockEnvVars.NODE_ENV = 'production'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_URL = 'https://prod.supabase.co'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'prod-key'
      mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_URL = 'https://proxy.amazonaws.com'
      mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_ANON_KEY = 'proxy-key'
      
      const config = getActiveSupabaseConfig()
      expect(config).toEqual({
        url: 'https://proxy.amazonaws.com',
        anonKey: 'proxy-key'
      })
    })

    it('should fallback to main config when proxy is not available', () => {
      mockEnvVars.NODE_ENV = 'production'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_URL = 'https://prod.supabase.co'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'prod-key'
      
      const config = getActiveSupabaseConfig()
      expect(config).toEqual({
        url: 'https://prod.supabase.co',
        anonKey: 'prod-key'
      })
    })

    it('should use main config in development', () => {
      mockEnvVars.NODE_ENV = 'development'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_URL = 'https://dev.supabase.co'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dev-key'
      mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_URL = 'https://proxy.amazonaws.com'
      mockEnvVars.NEXT_PUBLIC_SUPABASEAPIPA8_ANON_KEY = 'proxy-key'
      
      const config = getActiveSupabaseConfig()
      expect(config).toEqual({
        url: 'https://dev.supabase.co',
        anonKey: 'dev-key'
      })
    })
  })

  describe('isSupabaseConfigured', () => {
    it('should return false when no config is available', () => {
      expect(isSupabaseConfigured()).toBe(false)
    })

    it('should return true when config is available', () => {
      mockEnvVars.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      mockEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      
      expect(isSupabaseConfigured()).toBe(true)
    })
  })
})