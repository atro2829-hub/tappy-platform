import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://npdpudrjjvcfsfrhvbyc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZHB1ZHJqanZjZnNmcmh2YnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxODM5ODQsImV4cCI6MjA5ODc1OTk4NH0.GdtwsBGwtV5WO5kVi05EVGeAkkNEqD3U_DIqoNZ-hkU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

export const CURRENCIES = {
  YER: { symbol: 'ر.ي', decimals: 0, name: 'Yemeni Rial' },
  SAR: { symbol: 'ر.س', decimals: 2, name: 'Saudi Riyal' },
  USD: { symbol: '$', decimals: 2, name: 'US Dollar' },
}

export function formatMoney(minor: number, currency: string = 'YER'): string {
  const c = CURRENCIES[currency as keyof typeof CURRENCIES] || CURRENCIES.USD
  const major = minor / Math.pow(10, c.decimals)
  return `${major.toFixed(c.decimals)} ${c.symbol}`
}
