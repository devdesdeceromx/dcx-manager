import { supabase } from '@/shared/lib/supabase'

export type ProjectStatus = 'preparation' | 'waiting_deposit' | 'ready_to_start' | 'development' | 'review' | 'adjustments' | 'ready_delivery' | 'delivered' | 'warranty' | 'closed' | 'paused' | 'cancelled'
export type PaymentKind = 'deposit' | 'partial' | 'final'
export type PaymentMethod = 'transfer' | 'cash' | 'card' | 'other'
export type ProjectPayment = { id:string; kind:PaymentKind; amount:number; method:PaymentMethod; paid_at:string; reference:string|null; notes:string|null; created_at:string }
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high'
export type ProjectTask = { id:string; project_id:string; title:string; description:string|null; status:TaskStatus; priority:TaskPriority; assignee_id:string|null; due_date:string|null; deliverable_url:string|null; deliverable_notes:string|null; created_at:string }
export type Project = { id:string; folio:string; name:string; description:string|null; price:number; status:ProjectStatus; progress:number; estimated_delivery:string|null; clients:{name:string;business_name:string|null}|null; project_payments:ProjectPayment[]; project_tasks:ProjectTask[] }
export type PaymentInput = { project_uuid:string; payment_kind:PaymentKind; payment_amount:number; payment_method:PaymentMethod; payment_date:string; payment_reference:string|null; payment_notes:string|null }

export async function listProjects() {
  return supabase.from('projects').select('*, clients(name, business_name), project_payments(id, kind, amount, method, paid_at, reference, notes, created_at), project_tasks(id, project_id, title, description, status, priority, assignee_id, due_date, deliverable_url, deliverable_notes, created_at)').order('created_at', { ascending: false }).returns<Project[]>()
}

export async function updateProject(id:string, updates:{status?:ProjectStatus;progress?:number;estimated_delivery?:string|null}) {
  return supabase.from('projects').update(updates).eq('id',id)
}

export async function registerPayment(input: PaymentInput) {
  return supabase.rpc('register_project_payment', input)
}

export async function createProjectTask(input: Omit<ProjectTask,'id'|'created_at'>) {
  return supabase.from('project_tasks').insert(input)
}

export async function updateProjectTask(id:string, updates:Partial<Pick<ProjectTask,'title'|'description'|'status'|'priority'|'assignee_id'|'due_date'|'deliverable_url'|'deliverable_notes'>>) {
  return supabase.from('project_tasks').update(updates).eq('id',id)
}

export async function deleteProjectTask(id:string) {
  return supabase.from('project_tasks').delete().eq('id',id)
}

export async function listActiveStaff() {
  return supabase.rpc('list_active_staff')
}
