import {
  ArrowRight, Blocks, Bot, Check, ChevronRight, Code2, Facebook,
  Instagram, Menu, MessageCircle, Play, Rocket, Sparkles, Target,
  X, Youtube, Zap,
} from "lucide-react";
import { useState } from "react";
import { socialLinks } from "./socials";

const services = [
  { icon: Code2, number: "01", title: "Sitios web", text: "Experiencias rápidas, claras y diseñadas para convertir visitas en oportunidades reales." },
  { icon: Blocks, number: "02", title: "Sistemas a medida", text: "Herramientas que ordenan tu operación, eliminan tareas repetitivas y crecen contigo." },
  { icon: Bot, number: "03", title: "Automatización", text: "Conectamos procesos y datos para que tu negocio avance incluso cuando tú no estás." },
];

const steps = [
  ["01", "Entendemos", "Escuchamos tu idea, tus objetivos y el problema que realmente necesitas resolver."],
  ["02", "Diseñamos", "Convertimos lo complejo en una experiencia sencilla, útil y con personalidad."],
  ["03", "Construimos", "Desarrollamos con tecnología moderna, avances claros y atención al detalle."],
  ["04", "Impulsamos", "Publicamos, medimos y seguimos mejorando para que tu inversión genere valor."],
];

const socialItems = [
  { key: "tiktok", label: "TikTok", icon: Play },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "youtube", label: "YouTube", icon: Youtube },
] as const;

function Logo() {
  return <a className="logo" href="#inicio" aria-label="DevDesdeCeroMx, inicio">
    <span className="logo-mark"><Blocks size={21}/></span>
    <span><strong>DevDesdeCero</strong><b>Mx</b></span>
  </a>;
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSocials = socialItems.filter(({ key }) => socialLinks[key]);

  return <div className="site-shell">
    <header className="site-header">
      <Logo />
      <nav className={menuOpen ? "nav-open" : ""} aria-label="Navegación principal">
        <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
        <a href="#proceso" onClick={() => setMenuOpen(false)}>Proceso</a>
        <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
        <a href="#contacto" className="nav-cta" onClick={() => setMenuOpen(false)}>Hablemos <ArrowRight size={15}/></a>
      </nav>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section className="hero" id="inicio">
        <div className="hero-glow"/>
        <div className="hero-copy">
          <span className="eyebrow"><i/> Desarrollo digital con propósito</span>
          <h1>Tu idea merece<br/>algo que <em>funcione.</em></h1>
          <p>Diseñamos sitios web y soluciones digitales que convierten procesos complicados en experiencias simples, útiles y listas para crecer.</p>
          <div className="hero-actions">
            <a className="button primary" href="#contacto">Quiero empezar <ArrowRight size={18}/></a>
            <a className="button ghost" href="#servicios"><Play size={15} fill="currentColor"/> Descubre cómo</a>
          </div>
          <div className="hero-proof"><span><Check size={14}/> Atención cercana</span><span><Check size={14}/> Soluciones a medida</span><span><Check size={14}/> Sin vueltas técnicas</span></div>
        </div>
        <div className="hero-visual" aria-label="Representación de una experiencia digital">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="code-card">
            <div className="window-bar"><span/><span/><span/><small>devdesdeceromx.dev</small></div>
            <div className="code-body">
              <div className="mini-sidebar"><b>DCX</b><i/><i/><i/></div>
              <div className="mini-content"><span>CONSTRUYENDO ALGO INCREÍBLE</span><strong>Ideas que se vuelven<br/>realidad digital.</strong><div className="mini-button">Comenzar proyecto</div><div className="mini-grid"><i/><i/><i/></div></div>
            </div>
          </div>
          <div className="float-card float-top"><span><Zap size={16}/></span><div><small>Rendimiento</small><strong>98/100</strong></div></div>
          <div className="float-card float-bottom"><span><Target size={16}/></span><div><small>Enfoque</small><strong>Resultados</strong></div></div>
        </div>
        <div className="scroll-cue">SCROLL <i/></div>
      </section>

      <section className="section services" id="servicios">
        <div className="section-heading"><div><span className="kicker">LO QUE HACEMOS</span><h2>Tecnología que trabaja<br/><em>a tu favor.</em></h2></div><p>No vendemos paquetes genéricos. Construimos exactamente lo que tu proyecto necesita para dar el siguiente paso.</p></div>
        <div className="service-grid">{services.map(({ icon: Icon, number, title, text }) => <article className="service-card" key={title}><div className="service-top"><span><Icon/></span><small>{number}</small></div><h3>{title}</h3><p>{text}</p><a href="#contacto">Cuéntame tu idea <ChevronRight size={15}/></a></article>)}</div>
      </section>

      <section className="dark-section" id="nosotros">
        <div className="manifesto">
          <span className="kicker light">POR QUÉ DEVDEsDECEROMX</span>
          <h2>No necesitas saber de código.<br/><em>Necesitas un aliado que sí.</em></h2>
          <p>La tecnología no debería sentirse complicada ni lejana. Te acompañamos desde la primera idea hasta el lanzamiento, hablando claro y tomando cada decisión contigo.</p>
          <div className="values"><div><strong>01.</strong><span>Claridad antes que tecnicismos.</span></div><div><strong>02.</strong><span>Diseño con intención, no decoración.</span></div><div><strong>03.</strong><span>Soluciones pensadas para durar.</span></div></div>
        </div>
        <div className="statement-card"><Sparkles/><span>DESDE CERO</span><strong>no significa<br/>empezar solo.</strong><p>Significa construir sobre una base correcta.</p></div>
      </section>

      <section className="section process" id="proceso">
        <div className="section-heading"><div><span className="kicker">NUESTRO PROCESO</span><h2>De la idea al <em>impacto.</em></h2></div><p>Un proceso transparente para que siempre sepas qué estamos haciendo, por qué y qué sigue.</p></div>
        <div className="process-list">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><ArrowRight/></article>)}</div>
      </section>

      <section className="contact" id="contacto">
        <div className="contact-orb"/><div className="contact-copy"><span className="kicker light">HAGAMOS ALGO GRANDE</span><h2>¿Tienes una idea?<br/><em>Vamos a construirla.</em></h2><p>Cuéntanos qué tienes en mente. La primera conversación es para entenderte, sin compromisos y sin tecnicismos.</p><a className="button white" href="mailto:devdesdeceromx@gmail.com?subject=Quiero%20iniciar%20un%20proyecto">Iniciar una conversación <MessageCircle size={18}/></a></div>
        <div className="contact-note"><Rocket/><div><strong>Tu proyecto puede empezar hoy.</strong><span>Escríbenos a devdesdeceromx@gmail.com</span></div></div>
      </section>
    </main>

    <footer>
      <div><Logo/><p>Soluciones digitales claras para ideas que quieren crecer.</p></div>
      <div className="footer-links"><strong>Explora</strong><a href="#servicios">Servicios</a><a href="#proceso">Proceso</a><a href="#nosotros">Nosotros</a></div>
      <div className="footer-social"><strong>Síguenos</strong>{activeSocials.length ? <div>{activeSocials.map(({ key, label, icon: Icon }) => <a href={socialLinks[key]} key={key} target="_blank" rel="noreferrer" aria-label={label}><Icon size={18}/></a>)}</div> : <span>Muy pronto en redes</span>}</div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} DevDesdeCeroMx</span><span>Hecho con intención en México 🇲🇽</span></div>
    </footer>
  </div>;
}
