import { supabase } from '@/shared/lib/supabase'

export type AppRole='administrator'|'development'|'administration'|'collaborator'|'read_only'
export type StaffMember={id:string;full_name:string|null;email:string|null;role:AppRole;is_active:boolean;created_at:string;updated_at:string}
export async function listStaff(){const result=await supabase.rpc('list_staff_members');return{...result,data:result.data as StaffMember[]|null}}
export async function updateStaffMember(id:string,role:AppRole,isActive:boolean){return supabase.rpc('update_staff_member',{target_id:id,new_role:role,active:isActive})}
