import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { AppRole } from '@/shared/lib/permissions'
export function AccessRoute({roles,children}:{roles:AppRole[];children:ReactNode}){const{role}=useAuth();return role&&roles.includes(role)?children:<Navigate to="/dashboard" replace/>}
