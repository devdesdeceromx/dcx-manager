import { supabase } from '@/shared/lib/supabase'

export type ActivityEntry={id:number;actor_id:string|null;actor_name:string|null;actor_email:string|null;action:string;entity_type:string;entity_id:string|null;metadata:Record<string,unknown>;created_at:string}
export async function listActivityAudit(){const result=await supabase.rpc('list_activity_audit');return{...result,data:result.data as ActivityEntry[]|null}}
