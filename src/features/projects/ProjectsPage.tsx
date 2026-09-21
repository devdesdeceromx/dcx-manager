import { FolderKanban } from 'lucide-react'
import { EmptyModulePage } from '@/shared/components/EmptyModulePage'

export function ProjectsPage() {
  return <EmptyModulePage title="Proyectos" description="Organiza entregas, responsables y avances." action="Crear proyecto" icon={FolderKanban} />
}
