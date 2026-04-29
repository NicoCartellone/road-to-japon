import { NavLink } from 'react-router-dom'

function navClassName({ isActive }: { isActive: boolean }) {
  return `nav-btn${isActive ? ' is-active' : ''}`
}

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación">
      <NavLink to="/" className={navClassName} aria-label="Inicio" end>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
          <path
            fill="currentColor"
            d="M12 3.1 3.5 10.3a1 1 0 0 0-.35.76V20a1.5 1.5 0 0 0 1.5 1.5H9a1 1 0 0 0 1-1v-5.5h4V20.5a1 1 0 0 0 1 1h4.35A1.5 1.5 0 0 0 20.85 20v-8.94a1 1 0 0 0-.35-.76L12 3.1Z"
          />
        </svg>
      </NavLink>

      <NavLink to="/checklist" className={navClassName} aria-label="Checklist">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
          <path fill="currentColor" d="M7 6.5h14v2H7v-2Zm0 5h14v2H7v-2Zm0 5h14v2H7v-2Z" />
          <path
            fill="currentColor"
            d="M3 7a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm0 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm0 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z"
          />
        </svg>
      </NavLink>

      <NavLink to="/itinerario" className={navClassName} aria-label="Itinerario">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
          <path
            fill="currentColor"
            d="M12 2.75c-3.6 0-6.5 2.86-6.5 6.38 0 4.77 5.2 10.62 6.16 11.67a.5.5 0 0 0 .68 0c.96-1.05 6.16-6.9 6.16-11.67 0-3.52-2.9-6.38-6.5-6.38Zm0 9.1a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
          />
        </svg>
      </NavLink>

      <NavLink to="/conversor" className={navClassName} aria-label="Conversor">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-ico">
          <path
            fill="currentColor"
            d="M7 7h12l-2.25-2.25L18.5 3 23 7.5 18.5 12l-1.75-1.75L19 8H7V7Zm10 10H5l2.25 2.25L5.5 21 1 16.5 5.5 12l1.75 1.75L5 16h12v1Z"
          />
        </svg>
      </NavLink>
    </nav>
  )
}
