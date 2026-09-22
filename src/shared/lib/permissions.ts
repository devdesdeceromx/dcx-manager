export type AppRole='administrator'|'development'|'administration'|'collaborator'|'read_only'
export const allRoles:AppRole[]=['administrator','development','administration','collaborator','read_only']
export const commercialRoles:AppRole[]=['administrator','administration','read_only']
export const projectRoles:AppRole[]=['administrator','development','administration','collaborator','read_only']
export const financeRoles:AppRole[]=['administrator','administration','read_only']
export const adminRoles:AppRole[]=['administrator']
export const workRoles:AppRole[]=['administrator','development','collaborator']
export function canManageCommercial(role:AppRole|null){return role==='administrator'||role==='administration'}
export function canManageOperations(role:AppRole|null){return role==='administrator'||role==='development'}
export function canManageFinance(role:AppRole|null){return role==='administrator'||role==='administration'}
