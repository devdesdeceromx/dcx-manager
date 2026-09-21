import type { LucideIcon } from 'lucide-react'

type EmptyModulePageProps = {
  title: string
  description: string
  action: string
  icon: LucideIcon
}

export function EmptyModulePage({ title, description, action, icon: Icon }: EmptyModulePageProps) {
  return (
    <>
      <header className="module-header"><div><span className="eyebrow dark">Espacio de trabajo</span><h1>{title}</h1><p>{description}</p></div></header>
      <section className="panel module-empty"><div className="module-empty-icon"><Icon size={27} /></div><h2>Todo listo para comenzar</h2><p>Esta sección ya forma parte de la navegación. El siguiente paso es definir qué información necesitas guardar.</p><button className="new-button" disabled>{action}</button><small>Disponible al conectar el modelo de datos</small></section>
    </>
  )
}
