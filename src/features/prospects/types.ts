export type ProspectStatus = 'new' | 'contacted' | 'qualified' | 'quote' | 'negotiation' | 'won' | 'lost'
export type ProspectSource = 'referral' | 'facebook' | 'tiktok' | 'website' | 'whatsapp' | 'existing_client' | 'direct_contact' | 'other'

export type Prospect = {
  id: string
  folio: string
  name: string
  business_name: string | null
  phone: string | null
  email: string | null
  service_interest: string
  source: ProspectSource
  estimated_budget: number | null
  status: ProspectStatus
  description: string | null
  notes: string | null
  converted_at: string | null
  created_at: string
}

export type ProspectInput = {
  name: string
  business_name?: string
  phone?: string
  email?: string
  service_interest: string
  source: ProspectSource
  estimated_budget?: number
  description?: string
  notes?: string
  status?: ProspectStatus
}
