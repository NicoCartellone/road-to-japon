# Road to Japón 🇯🇵

PWA simple para el viaje a Japón: cuenta regresiva + herramientas rápidas (checklist, itinerario, conversor).

## Stack
- Vite + React + TypeScript
- PWA: `vite-plugin-pwa`
- Router: `react-router-dom` (BrowserRouter)

## Requisitos
- Node.js + npm

## Correr en local
```bash
npm install
npm run dev
```

## Rutas
- `/` — Inicio (cuenta regresiva)
- `/checklist` — Checklist (template)
- `/itinerario` — Itinerario (template)
- `/conversor` — Conversor (JPY → USD/ARS)

## Estructura del proyecto
- `src/pages/` — pantallas (rutas)
- `src/features/` — features aisladas (ej: conversor)
- `src/shared/` — UI y utilidades compartidas

## Conversor: actualizar cotizaciones
Las cotizaciones están hardcodeadas para simplicidad.

Editá:
- `src/features/converter/rates.ts`

Ahí vas a encontrar:
- `RATES_AS_OF` (fecha)
- `JPY_PER_USD` (1 USD = X JPY)
- `ARS_PER_USD_BLUE` (1 USD = X ARS, blue)

## Deploy (Netlify)
- La rama de deploy es **`main`**.
- Este proyecto usa BrowserRouter, por eso existe un redirect SPA:
  - `netlify.toml`: `/* -> /index.html (200)`

## Notas (iOS/PWA)
Hay fixes específicos para iOS (safe-areas, status bar y evitar bounce/scroll). Si tocás layout global o PWA, probá en iOS.
