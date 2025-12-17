import { NavLink } from "react-router-dom";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => (isActive ? "active" : "")}
    >
      {label}
    </NavLink>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <div className="brand">
              <img
                src="/logo.png"   
                alt="Logo"
                className="logo-box"
              />

              <div>
                <div className="brand-title">Estoque Espetim do Nin</div>
                <div className="brand-subtitle">
                  Controle diário • Rendimento • Histórico
                </div>
              </div>
            </div>
          </div>

          <nav className="nav">
            <NavItem to="/" label="Hoje" />
            <NavItem to="/historico" label="Histórico" />
            <NavItem to="/rendimento" label="Rendimento" />
            <NavItem to="/itens" label="Itens" />
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="surface">{children}</div>
          <div className="footer">
            © {new Date().getFullYear()} • Estoque Espetim do Nin
          </div>
        </div>
      </main>
    </div>
  );
}
