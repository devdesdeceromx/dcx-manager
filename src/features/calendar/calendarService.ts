import { supabase } from '@/shared/lib/supabase'
import type { TaskPriority, TaskStatus } from '@/features/projects/projectService'

export type CalendarTask = {
  id:string
  project_id:string
  title:string
  status:TaskStatus
  priority:TaskPriority
  assignee_id:string|null
  due_date:string
  projects:{folio:string;name:string}|null
}

export async function listCalendarTasks() {
  return supabase.from('project_tasks').select('id, project_id, title, status, priority, assignee_id, due_date, projects(folio, name)').not('due_date','is',null).order('due_date').returns<CalendarTask[]>()
}
