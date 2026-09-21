import { supabase } from '@/shared/lib/supabase'

export type BusinessSettings = { id:boolean; business_name:string; legal_name:string|null; tax_id:string|null; email:string|null; phone:string|null; address:string|null; website:string|null; logo_url:string|null; currency:string; default_tax:number; quote_validity_days:number; quote_terms:string|null; receipt_notes:string|null; updated_at:string }
export type BusinessSettingsInput = Omit<BusinessSettings,'id'|'updated_at'>

export async function getBusinessSettings(){return supabase.from('business_settings').select('*').eq('id',true).single<BusinessSettings>()}
export async function updateBusinessSettings(input:BusinessSettingsInput){const{data}=await supabase.auth.getUser();return supabase.from('business_settings').update({...input,updated_by:data.user?.id}).eq('id',true)}
