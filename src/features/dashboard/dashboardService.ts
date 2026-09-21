import { supabase } from '@/shared/lib/supabase'
import type { ProspectStatus } from '@/features/prospects/types'

export type DashboardActivity = {
  id: number
  action: string
  entity_type: string
  created_at: string
}

export type DashboardData = {
  newProspects: number
  activeClients: number
  pendingQuotes: number
  activeProjects: number
  overdueTasks: number
  dueSoonTasks: number
  collectedRevenue: number
  projectExpenses: number
  totalProspects: number
  pipeline: Record<ProspectStatus, number>
  activity: DashboardActivity[]
}

const emptyPipeline: Record<ProspectStatus, number> = { new: 0, contacted: 0, qualified: 0, quote: 0, negotiation: 0, won: 0, lost: 0 }

export async function getDashboardData(): Promise<DashboardData> {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const dateKey = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
  const today = new Date(), nextWeek = new Date(today); nextWeek.setDate(today.getDate()+7)
  const [newProspectsResult, activeClientsResult, pendingQuotesResult, activeProjectsResult, overdueTasksResult, dueSoonTasksResult, paymentsResult, expensesResult, prospectsResult, activityResult] = await Promise.all([
    supabase.from('prospects').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).in('status', ['draft', 'sent', 'viewed', 'negotiation']),
    supabase.from('projects').select('*', { count: 'exact', head: true }).in('status', ['preparation', 'waiting_deposit', 'ready_to_start', 'development', 'review', 'adjustments', 'ready_delivery', 'delivered', 'warranty', 'paused']),
    supabase.from('project_tasks').select('*', { count: 'exact', head: true }).lt('due_date', dateKey(today)).neq('status','completed'),
    supabase.from('project_tasks').select('*', { count: 'exact', head: true }).gte('due_date', dateKey(today)).lte('due_date', dateKey(nextWeek)).neq('status','completed'),
    supabase.from('project_payments').select('amount'),
    supabase.from('project_expenses').select('amount'),
    supabase.from('prospects').select('status'),
    supabase.from('activity_logs').select('id, action, entity_type, created_at').order('created_at', { ascending: false }).limit(6).returns<DashboardActivity[]>(),
  ])

  const error = newProspectsResult.error ?? activeClientsResult.error ?? pendingQuotesResult.error ?? activeProjectsResult.error ?? overdueTasksResult.error ?? dueSoonTasksResult.error ?? paymentsResult.error ?? expensesResult.error ?? prospectsResult.error ?? activityResult.error
  if (error) throw error

  const pipeline = { ...emptyPipeline }
  for (const prospect of prospectsResult.data ?? []) pipeline[prospect.status as ProspectStatus] += 1

  return {
    newProspects: newProspectsResult.count ?? 0,
    activeClients: activeClientsResult.count ?? 0,
    pendingQuotes: pendingQuotesResult.count ?? 0,
    activeProjects: activeProjectsResult.count ?? 0,
    overdueTasks: overdueTasksResult.count ?? 0,
    dueSoonTasks: dueSoonTasksResult.count ?? 0,
    collectedRevenue: (paymentsResult.data ?? []).reduce((sum,item)=>sum+Number(item.amount),0),
    projectExpenses: (expensesResult.data ?? []).reduce((sum,item)=>sum+Number(item.amount),0),
    totalProspects: prospectsResult.data?.length ?? 0,
    pipeline,
    activity: activityResult.data ?? [],
  }
}
