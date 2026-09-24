import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url && key)
export const supabase = createClient(url || 'http://127.0.0.1:54321', key || 'configuration-missing', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})

export type Project = { id:string; folio:string; name:string; project_tasks:{id:string;title:string;status:string}[] }
export type Entry = { id:string; project_id:string; task_id:string|null; status:'running'|'paused'|'completed'; last_resumed_at:string; accumulated_seconds:number; ended_at:string|null; projects:{name:string;folio:string}|null; project_tasks:{title:string}|null }
