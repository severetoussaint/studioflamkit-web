# Decisiones Arquitectónicas (ADR)

ADR-001 — `src/app/dashboard/page.tsx` es el coordinador oficial del Dashboard del autor.

ADR-002 — Comunicación es independiente del estado editorial.

ADR-003 — Notifications, Messages, Reviews, Timeline, Internal Notes y Proposals son conceptos diferentes y no deben mezclarse artificialmente.

ADR-004 — No se crearán tablas nuevas en Supabase hasta comprobar primero si la infraestructura existente puede reutilizarse.

ADR-005 — Dashboard y Admin pueden tener diseños diferentes aunque compartan servicios, datos o componentes cuando tenga sentido.

ADR-006 — Cada nueva función debe analizarse considerando función, ubicación, sección, diseño, datos, permisos, relaciones, escalabilidad y pruebas.

ADR-007 — No se modifica una decisión arquitectónica existente sin documentar primero la nueva decisión y su motivo.
