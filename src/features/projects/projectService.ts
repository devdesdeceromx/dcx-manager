import { supabase } from '@/shared/lib/supabase'

export type ProjectStatus = 'preparation' | 'waiting_deposit' | 'ready_to_start' | 'development' | 'review' | 'adjustments' | 'ready_delivery' | 'delivered' | 'warranty' | 'closed' | 'paused' | 'cancelled'
export type Project = { id:string; folio:string; name:string; description:string|null; price:number; status:ProjectStatus; progress:number; estimated_delivery:string|null; clients:{name:string;business_name:string|null}|null }

export async function listProjects() {
  return supabase.from('projects').select('*, clients(name, business_name)').order('created_at', { ascending: false }).returns<Project[]>()
}

export async function updateProject(id:string, updates:{status?:ProjectStatus;progress?:number;estimated_delivery?:string|null}) {
  return supabase.from('projects').update(updates).eq('id',id)
}
