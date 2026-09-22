import { Component, type ErrorInfo, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("DevDesdeCeroMx Manager encontró un error inesperado", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="system-message"><div className="icon-tile warning"><TriangleAlert size={22} /></div><h1>No pudimos cargar esta pantalla</h1><p>Tu información está segura. Recarga la aplicación para intentarlo nuevamente.</p><button className="primary-button" onClick={() => window.location.reload()}>Recargar aplicación</button></main>;
  }
}
