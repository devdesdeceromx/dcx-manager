import { supabase } from '@/shared/lib/supabase'
export type WorkProject={id:string;folio:string;name:string;project_tasks:{id:string;title:string;status:string;assignee_id:string|null}[]}
export type TimeEntry={id:string;project_id:string;task_id:string|null;status:'running'|'paused'|'completed';started_at:string;last_resumed_at:string;accumulated_seconds:number;ended_at:string|null;notes:string|null;billable:boolean;projects:{name:string;folio:string}|null;project_tasks:{title:string}|null}
export async function listWorkProjects(){return supabase.from('projects').select('id,folio,name,project_tasks(id,title,status,assignee_id)').not('status','in','("closed","cancelled")').order('created_at',{ascending:false}).returns<WorkProject[]>()}
export async function listMyTimeEntries(){return supabase.from('time_entries').select('*,projects(name,folio),project_tasks(title)').order('started_at',{ascending:false}).limit(40).returns<TimeEntry[]>()}
export async function startTimer(project:string,task:string|null,notes:string,billable:boolean){return supabase.rpc('start_time_entry',{p_project_id:project,p_task_id:task,p_notes:notes||null,p_billable:billable})}
export async function pauseTimer(id:string){return supabase.rpc('pause_time_entry',{p_entry_id:id})}
export async function resumeTimer(id:string){return supabase.rpc('resume_time_entry',{p_entry_id:id})}
export async function stopTimer(id:string,notes:string){return supabase.rpc('stop_time_entry',{p_entry_id:id,p_notes:notes||null})}
export async function addManual(project:string,task:string|null,date:string,minutes:number,notes:string,billable:boolean){return supabase.rpc('add_manual_time_entry',{p_project_id:project,p_task_id:task,p_work_date:date,p_minutes:minutes,p_notes:notes||null,p_billable:billable})}
