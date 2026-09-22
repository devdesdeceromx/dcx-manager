-- Limit callable database functions to the roles that actually use them.
-- Trigger-only helpers remain executable exclusively by their owners.

revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.log_crm_change() from public, anon, authenticated;
revoke all on function public.recalculate_quote(uuid) from public, anon, authenticated;
revoke all on function public.quote_items_recalculate() from public, anon, authenticated;
revoke all on function public.recalculate_project_progress(uuid) from public, anon, authenticated;
revoke all on function public.project_tasks_recalculate_progress() from public, anon, authenticated;

revoke all on function public.is_active_staff() from public, anon;
revoke all on function public.is_administrator() from public, anon;
revoke all on function public.get_my_access() from public, anon;
revoke all on function public.has_any_role(public.app_role[]) from public, anon;
revoke all on function public.can_access_project(uuid) from public, anon;
revoke all on function public.convert_prospect_to_client(uuid) from public, anon;
revoke all on function public.accept_quote_and_create_project(uuid) from public, anon;
revoke all on function public.register_project_payment(uuid, public.payment_kind, numeric, public.payment_method, date, text, text) from public, anon;
revoke all on function public.list_active_staff() from public, anon;
revoke all on function public.update_staff_member(uuid, public.app_role, boolean) from public, anon;
revoke all on function public.list_staff_members() from public, anon;
revoke all on function public.list_activity_audit() from public, anon;

grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.is_administrator() to authenticated;
grant execute on function public.get_my_access() to authenticated;
grant execute on function public.has_any_role(public.app_role[]) to authenticated;
grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.convert_prospect_to_client(uuid) to authenticated;
grant execute on function public.accept_quote_and_create_project(uuid) to authenticated;
grant execute on function public.register_project_payment(uuid, public.payment_kind, numeric, public.payment_method, date, text, text) to authenticated;
grant execute on function public.list_active_staff() to authenticated;
grant execute on function public.update_staff_member(uuid, public.app_role, boolean) to authenticated;
grant execute on function public.list_staff_members() to authenticated;
grant execute on function public.list_activity_audit() to authenticated;
