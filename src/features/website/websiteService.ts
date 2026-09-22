import { supabase } from '@/shared/lib/supabase'

export type WebsiteSettings = {
  id: boolean
  contact_email: string
  contact_phone: string | null
  tiktok_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  hero_eyebrow_es: string
  hero_eyebrow_en: string
  hero_title_es: string
  hero_title_en: string
  hero_highlight_es: string
  hero_highlight_en: string
  hero_description_es: string
  hero_description_en: string
  show_services: boolean
  show_industries: boolean
  show_process: boolean
  show_about: boolean
  updated_at: string
}

export type WebsiteSettingsInput = Omit<WebsiteSettings, 'id' | 'updated_at'>

export async function getWebsiteSettings() {
  return supabase.from('website_settings').select('*').eq('id', true).single<WebsiteSettings>()
}

export async function updateWebsiteSettings(input: WebsiteSettingsInput) {
  const { data } = await supabase.auth.getUser()
  return supabase.from('website_settings').update({ ...input, updated_by: data.user?.id }).eq('id', true)
}
