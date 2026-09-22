import { Boxes } from 'lucide-react'

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className={`brand ${inverted ? 'brand-inverted' : ''}`}>
      <span className="brand-mark"><Boxes size={22} strokeWidth={2.2} /></span>
      <span className="brand-name"><strong>DevDesdeCeroMx</strong><small>Manager</small></span>
    </div>
  )
}
