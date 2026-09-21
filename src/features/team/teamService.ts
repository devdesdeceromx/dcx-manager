import { supabase } from "@/shared/lib/supabase";

export type AppRole =
  | "administrator"
  | "development"
  | "administration"
  | "collaborator"
  | "read_only";

export type StaffMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  is_active: boolean;
  invitation_status: "pending" | "accepted";
  invited_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listStaff() {
  const result = await supabase.rpc("list_staff_members");
  return { ...result, data: result.data as StaffMember[] | null };
}

export async function updateStaffMember(
  id: string,
  role: AppRole,
  isActive: boolean,
) {
  return supabase.rpc("update_staff_member", {
    target_id: id,
    new_role: role,
    active: isActive,
  });
}

async function manageInvitation(body: Record<string, string>) {
  return supabase.functions.invoke<{ userId?: string }>("invite-user", {
    body,
  });
}

export async function inviteStaffMember(
  email: string,
  fullName: string,
  role: AppRole,
) {
  return manageInvitation({ action: "invite", email, fullName, role });
}

export async function resendStaffInvitation(userId: string) {
  return manageInvitation({ action: "resend", userId });
}

export async function cancelStaffInvitation(userId: string) {
  return manageInvitation({ action: "cancel", userId });
}
