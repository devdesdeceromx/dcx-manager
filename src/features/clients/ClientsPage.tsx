import { Users } from 'lucide-react'
import { EmptyModulePage } from '@/shared/components/EmptyModulePage'

export function ClientsPage() {
  return <EmptyModulePage title="Clientes" description="Centraliza contactos y relaciones comerciales." action="Agregar cliente" icon={Users} />
}
