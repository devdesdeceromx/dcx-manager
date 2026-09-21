export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'negotiation' | 'accepted' | 'rejected' | 'expired'

export type QuoteItemInput = { description: string; quantity: number; unit_price: number }
export type Quote = {
  id: string
  folio: string
  client_id: string
  title: string
  description: string | null
  status: QuoteStatus
  subtotal: number
  discount: number
  tax: number
  total: number
  valid_until: string | null
  notes: string | null
  created_at: string
  clients: { name: string; business_name: string | null; email: string | null } | null
  quote_items: Array<QuoteItemInput & { sort_order: number }>
}

export type QuoteInput = {
  client_id: string
  title: string
  description?: string
  valid_until?: string
  notes?: string
  discount?: number
  tax?: number
}
