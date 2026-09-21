import { Bell, CalendarClock, CheckCheck, CircleDollarSign, FileText, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listNotifications, markNotificationsRead, type AppNotification } from './notificationService'

export function NotificationCenter(){
 const [open,setOpen]=useState(false),[items,setItems]=useState<AppNotification[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);const navigate=useNavigate(),unread=items.filter((item)=>!item.read).length
 const load=async()=>{const{data,error:requestError}=await listNotifications();setItems(data);setError(requestError?.message??null);setLoading(false)}
 useEffect(()=>{void listNotifications().then(({data,error:requestError})=>{setItems(data);setError(requestError?.message??null);setLoading(false)})},[])
 async function openItem(item:AppNotification){if(!item.read){await markNotificationsRead([item.key]);setItems((current)=>current.map((entry)=>entry.key===item.key?{...entry,read:true}:entry))}setOpen(false);navigate(item.to)}
 async function markAll(){const keys=items.filter((item)=>!item.read).map((item)=>item.key);const{error:requestError}=await markNotificationsRead(keys);if(requestError)setError(requestError.message);else await load()}
 return <><button className="nav-item" type="button" onClick={()=>setOpen(true)}><Bell size={19}/><span>Notificaciones</span>{unread>0&&<span className="badge">{unread>99?'99+':unread}</span>}</button>{open&&<div className="notification-backdrop" onClick={()=>setOpen(false)}><aside className="notification-drawer" onClick={(e)=>e.stopPropagation()}><header><div><span className="eyebrow dark">CENTRO DE ALERTAS</span><h2>Notificaciones</h2></div><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Cerrar"><X/></button></header><div className="notification-actions"><span>{unread} sin leer</span>{unread>0&&<button className="text-button" onClick={()=>void markAll()}><CheckCheck size={15}/> Marcar todas</button>}</div>{error&&<p className="auth-error">{error}</p>}<div className="notification-list">{loading?<p>Cargando alertas…</p>:items.length?items.map((item)=><button className={`notification-item ${item.read?'read':''} kind-${item.kind}`} onClick={()=>void openItem(item)} key={item.key}><NotificationIcon kind={item.kind}/><span><strong>{item.title}</strong><small>{item.detail}</small></span>{!item.read&&<i/>}</button>):<div className="notification-empty"><Bell size={24}/><strong>Todo al día</strong><span>No hay asuntos que requieran atención.</span></div>}</div></aside></div>}</>
}

function NotificationIcon({kind}:{kind:AppNotification['kind']}){return kind==='quote'?<FileText size={18}/>:kind==='deposit'?<CircleDollarSign size={18}/>:<CalendarClock size={18}/>}
