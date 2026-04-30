# Contribuir

Gracias por ayudar con la app.

## Flujo de trabajo (simple)
- Rama de deploy: **`main`**
- Para cambios: creá una rama `feature/<algo>` (opcional) y abrí PR a `main`.
- Si el cambio es chico, también podés commitear directo a `main` (pero preferimos PR para revisar).

## Commits
Usamos **Conventional Commits**:
- `feat: ...` nueva funcionalidad
- `fix: ...` bugfix
- `chore: ...` mantenimiento
- `docs: ...` documentación

## Checklist antes de abrir PR
- [ ] `npm run dev` y navegar a `/`, `/checklist`, `/itinerario`, `/conversor`
- [ ] Probar mobile (al menos responsive) y si se puede en iOS
- [ ] No romper el flujo de update de PWA

## Áreas sensibles
- `src/main.tsx` (registro de Service Worker)
- `index.html` (meta tags iOS/PWA)
- `src/style.css` (safe-area y fixes anti-scroll/bounce)

Si tocás esas áreas, avisalo en el PR.
