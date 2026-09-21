import { supabase } from '@/shared/lib/supabase'

export type NotificationKind = 'overdue'|'upcoming'|'quote'|'deposit'
export type AppNotification = { key:string;kind:NotificationKind;title:string;detail:string;date:string|null;to:string;read:boolean }

const todayKey=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}

export async function listNotifications():Promise<{data:AppNotification[];error:Error|null}> {
  const today=todayKey(), next=new Date();next.setDate(next.getDate()+7)
  const nextKey=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`
  const [userResult,tasksResult,projectsResult,quotesResult]=await Promise.all([
    supabase.auth.getUser(),
    supabase.from('project_tasks').select('id,title,due_date,status,projects(name)').neq('status','completed').not('due_date','is',null).lte('due_date',nextKey).order('due_date'),
    supabase.from('projects').select('id,name,updated_at').eq('status','waiting_deposit').order('updated_at'),
    supabase.from('quotes').select('id,folio,title,status,updated_at').in('status',['sent','viewed','negotiation']).order('updated_at'),
  ])
  const error=userResult.error??tasksResult.error??projectsResult.error??quotesResult.error
  if(error||!userResult.data.user)return {data:[],error:error??new Error('Sesión no disponible')}
  const readsResult=await supabase.from('notification_reads').select('notification_key').eq('user_id',userResult.data.user.id)
  if(readsResult.error)return {data:[],error:readsResult.error}
  const readKeys=new Set((readsResult.data??[]).map((item)=>item.notification_key))
  const items:AppNotification[]=[]
  for(const task of tasksResult.data??[]){const overdue=String(task.due_date)<today,key=`task:${task.id}:${task.due_date}`;const project=Array.isArray(task.projects)?task.projects[0]:task.projects;items.push({key,kind:overdue?'overdue':'upcoming',title:overdue?'Tarea vencida':'Vencimiento próximo',detail:`${task.title} · ${project?.name??'Proyecto'}`,date:String(task.due_date),to:'/calendar',read:readKeys.has(key)})}
  for(const project of projectsResult.data??[]){const key=`deposit:${project.id}:${project.updated_at}`;items.push({key,kind:'deposit',title:'Anticipo pendiente',detail:project.name,date:project.updated_at,to:'/projects',read:readKeys.has(key)})}
  for(const quote of quotesResult.data??[]){const key=`quote:${quote.id}:${quote.status}:${quote.updated_at}`;items.push({key,kind:'quote',title:'Cotización en seguimiento',detail:`${quote.folio} · ${quote.title}`,date:quote.updated_at,to:'/quotes',read:readKeys.has(key)})}
  return {data:items.sort((a,b)=>Number(a.read)-Number(b.read)||(a.date??'').localeCompare(b.date??'')),error:null}
}

export async function markNotificationsRead(keys:string[]){
  const {data:{user},error}=await supabase.auth.getUser();if(error||!user)return {error:error??new Error('Sesión no disponible')}
  if(!keys.length)return {error:null}
  return supabase.from('notification_reads').upsert(keys.map((key)=>({user_id:user.id,notification_key:key})),{onConflict:'user_id,notification_key'})
}
