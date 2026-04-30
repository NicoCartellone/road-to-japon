# AGENTS.md — Guía para colaborar con IA

Este repo se trabaja con ayuda de IA. Para mantener consistencia:

## Reglas del proyecto
- **CSS puro** (sin Tailwind por ahora).
- Router con **BrowserRouter** y rutas tipo `/checklist`.
- Deploy desde **`main`** (Netlify).
- Evitar cambios “creativos” en PWA/iOS sin probar.

## Decisiones ya tomadas
- Cuenta regresiva hacia **09/01/2027 23:00** en **America/Argentina/Buenos_Aires**.
- PWA con `vite-plugin-pwa`.
- Navbar inferior fijo + páginas template.
- Conversor: por ahora **JPY → USD/ARS** con **cotizaciones hardcodeadas** (blue para ARS).

## Don’t (importante)
- No desactivar safe-areas (`env(safe-area-inset-*)`) ni los fixes anti-bounce en iOS.
- No cambies el registro de SW si no sabés por qué (update flow es delicado en iOS).
- No metas dependencias nuevas sin justificar (app chica).

## Do (cómo sumar features)
- Preferí crear una feature en `src/features/<feature>/` y conectar desde `src/pages/`.
- Mantené componentes chicos y nombres explícitos.
- Para rates del conversor: editá `src/features/converter/rates.ts`.

## Verificaciones rápidas
- Rutas: `/`, `/checklist`, `/itinerario`, `/conversor`
- Mobile: layout + navbar + input del conversor (en iOS no debe hacer zoom)
