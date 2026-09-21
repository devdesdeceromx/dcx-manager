import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) throw new Error("Sesión no válida");
    const url = Deno.env.get("SUPABASE_URL")!,
      anonKey = Deno.env.get("SUPABASE_ANON_KEY")!,
      serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
      throw new Error("Solo un administrador puede invitar usuarios");
    const { email, fullName } = await request.json();
    if (typeof email !== "string" || !email.trim())
      throw new Error("El correo es obligatorio");
    if (typeof fullName !== "string" || !fullName.trim())
      throw new Error("El nombre es obligatorio");
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      { data: { full_name: fullName.trim() } },
    );
    if (error) throw error;
    return new Response(JSON.stringify({ userId: data.user?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible enviar la invitación";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
