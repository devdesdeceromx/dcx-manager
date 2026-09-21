import { supabase } from '@/shared/lib/supabase'

export type ExpenseCategory = 'tools'|'hosting'|'licenses'|'collaborators'|'advertising'|'taxes'|'other'
export type FinancePayment = { id:string; amount:number; paid_at:string }
export type ProjectExpense = { id:string; project_id:string; category:ExpenseCategory; description:string; amount:number; vendor:string|null; expense_date:string; reference:string|null; notes:string|null }
export type FinanceProject = { id:string; folio:string; name:string; price:number; clients:{name:string;business_name:string|null}|null; project_payments:FinancePayment[]; project_expenses:ProjectExpense[] }
export type ExpenseInput = Omit<ProjectExpense,'id'>

export async function listFinanceProjects(){
  return supabase.from('projects').select('id, folio, name, price, clients(name, business_name), project_payments(id, amount, paid_at), project_expenses(id, project_id, category, description, amount, vendor, expense_date, reference, notes)').order('created_at',{ascending:false}).returns<FinanceProject[]>()
}

export async function createExpense(input:ExpenseInput){return supabase.from('project_expenses').insert(input)}
export async function deleteExpense(id:string){return supabase.from('project_expenses').delete().eq('id',id)}
