import { isSupabaseConfigured, supabase } from "./supabase";

export type WebsiteLead = {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  language: "es" | "en";
  website: string;
};

export async function submitWebsiteLead(lead: WebsiteLead) {
  if (!isSupabaseConfigured) return { error: new Error("Supabase no está configurado.") };
  const { error } = await supabase.rpc("submit_website_lead", {
    lead_name: lead.name,
    lead_business_name: lead.businessName || null,
    lead_phone: lead.phone || null,
    lead_email: lead.email || null,
    lead_service: lead.service,
    lead_message: lead.message || null,
    lead_language: lead.language,
    website_field: lead.website || null,
  });
  return { error };
}
