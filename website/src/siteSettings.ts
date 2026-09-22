import { supabase } from './supabase'

export type PublicSiteSettings = {
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
}

export async function getPublicSiteSettings() {
  return supabase.from('website_settings').select('*').eq('id', true).single<PublicSiteSettings>()
}
