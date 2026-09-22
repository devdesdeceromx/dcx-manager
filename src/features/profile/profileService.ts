import { supabase } from "@/shared/lib/supabase";

export async function updateMyProfile(fullName: string) {
  const normalizedName = fullName.trim();
  const { error } = await supabase.rpc("update_my_profile", {
    new_full_name: normalizedName,
  });
  if (error) return { error };
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: normalizedName },
  });
  return { error: metadataError };
}
