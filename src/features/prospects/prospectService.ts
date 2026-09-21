import { supabase } from '@/shared/lib/supabase'
import type { NewProspect, Prospect } from './types'

export async function listProspects() {
  return supabase.from('prospects').select('*').order('created_at', { ascending: false }).returns<Prospect[]>()
}

export async function createProspect(prospect: NewProspect) {
  return supabase.from('prospects').insert(prospect).select().single<Prospect>()
}
