import { supabase } from '@/shared/lib/supabase'
import type { Prospect, ProspectInput, ProspectStatus } from './types'

export async function listProspects() {
  return supabase.from('prospects').select('*').order('created_at', { ascending: false }).returns<Prospect[]>()
}

export async function createProspect(prospect: ProspectInput) {
  return supabase.from('prospects').insert(prospect).select().single<Prospect>()
}

export async function updateProspect(id: string, prospect: ProspectInput) {
  return supabase.from('prospects').update(prospect).eq('id', id).select().single<Prospect>()
}

export async function updateProspectStatus(id: string, status: ProspectStatus) {
  return supabase.from('prospects').update({ status }).eq('id', id).select().single<Prospect>()
}

export async function convertProspect(id: string) {
  return supabase.rpc('convert_prospect_to_client', { prospect_uuid: id })
}
