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
  totalProspects: number
  pipeline: Record<ProspectStatus, number>
  activity: DashboardActivity[]
}

const emptyPipeline: Record<ProspectStatus, number> = { new: 0, contacted: 0, qualified: 0, quote: 0, negotiation: 0, won: 0, lost: 0 }

export async function getDashboardData(): Promise<DashboardData> {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [newProspectsResult, activeClientsResult, prospectsResult, activityResult] = await Promise.all([
    supabase.from('prospects').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('prospects').select('status'),
    supabase.from('activity_logs').select('id, action, entity_type, created_at').order('created_at', { ascending: false }).limit(6).returns<DashboardActivity[]>(),
  ])

  const error = newProspectsResult.error ?? activeClientsResult.error ?? prospectsResult.error ?? activityResult.error
  if (error) throw error

  const pipeline = { ...emptyPipeline }
  for (const prospect of prospectsResult.data ?? []) pipeline[prospect.status as ProspectStatus] += 1

  return {
    newProspects: newProspectsResult.count ?? 0,
    activeClients: activeClientsResult.count ?? 0,
    totalProspects: prospectsResult.data?.length ?? 0,
    pipeline,
    activity: activityResult.data ?? [],
  }
}
