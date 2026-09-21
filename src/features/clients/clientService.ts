import { supabase } from '@/shared/lib/supabase'

export type Client = {
  id: string
  folio: string
  name: string
  business_name: string | null
  phone: string | null
  email: string | null
  status: 'active' | 'inactive'
  created_at: string
}

export async function listClients() {
  return supabase.from('clients').select('*').order('created_at', { ascending: false }).returns<Client[]>()
}
