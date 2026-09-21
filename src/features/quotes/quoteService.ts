import { supabase } from '@/shared/lib/supabase'
import type { Quote, QuoteInput, QuoteItemInput, QuoteStatus } from './types'

export async function listQuotes() {
  return supabase.from('quotes').select('*, clients(name, business_name)').order('created_at', { ascending: false }).returns<Quote[]>()
}

export async function createQuote(input: QuoteInput, items: QuoteItemInput[]) {
  const { data: quote, error } = await supabase.from('quotes').insert(input).select().single<{ id: string }>()
  if (error || !quote) return { error }
  const { error: itemsError } = await supabase.from('quote_items').insert(items.map((item, index) => ({ ...item, quote_id: quote.id, sort_order: index })))
  return { error: itemsError }
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  return supabase.from('quotes').update({ status }).eq('id', id)
}
