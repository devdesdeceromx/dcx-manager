import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const roles = [
  "administrator",
  "development",
  "administration",
  "collaborator",
  "read_only",
] as const;
type AppRole = (typeof roles)[number];

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) throw new Error("Sesión no válida");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();
    if (authError || !user) throw new Error("Sesión no válida");

    const adminClient = createClient(url, serviceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();
    if (!profile?.is_active || profile.role !== "administrator")
      throw new Error("Solo un administrador puede gestionar invitaciones");

    const body = await request.json();
    const action = body.action ?? "invite";

    if (action === "invite") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const fullName = String(body.fullName ?? "").trim();
      const role = String(body.role ?? "read_only") as AppRole;
      if (!email) throw new Error("El correo es obligatorio");
      if (!fullName) throw new Error("El nombre es obligatorio");
      if (!roles.includes(role))
        throw new Error("El rol seleccionado no es válido");

      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        { data: { full_name: fullName, role } },
      );
      if (error) throw error;
      if (!data.user) throw new Error("No fue posible crear la invitación");

      const { error: profileError } = await adminClient
        .from("profiles")
        .update({ full_name: fullName, email, role, is_active: true })
        .eq("id", data.user.id);
      if (profileError) throw profileError;

      await adminClient.from("activity_logs").insert({
        actor_id: user.id,
        action: "staff_invited",
        entity_type: "profile",
        entity_id: data.user.id,
        metadata: { email, full_name: fullName, role },
      });
      return response({ userId: data.user.id });
    }

    const userId = String(body.userId ?? "");
    if (!userId) throw new Error("La invitación no es válida");
    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    if (error || !data.user) throw new Error("Usuario no encontrado");
    if (data.user.last_sign_in_at)
      throw new Error("Esta invitación ya fue aceptada");
    const email = data.user.email;
    if (!email) throw new Error("El usuario no tiene un correo válido");

    if (action === "resend") {
      const { error: resendError } = await adminClient.auth.resend({
        type: "signup",
        email,
      });
      if (resendError) throw resendError;
      await adminClient.from("activity_logs").insert({
        actor_id: user.id,
        action: "staff_invitation_resent",
        entity_type: "profile",
        entity_id: userId,
        metadata: { email },
      });
      return response({ userId });
    }

    if (action === "cancel") {
      const { error: deleteError } =
        await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;
      await adminClient.from("activity_logs").insert({
        actor_id: user.id,
        action: "staff_invitation_cancelled",
        entity_type: "profile",
        entity_id: userId,
        metadata: { email },
      });
      return response({ userId });
    }

    throw new Error("Acción no válida");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible gestionar la invitación";
    return response({ error: message }, 400);
  }
});
