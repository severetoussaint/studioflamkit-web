# Decisiones Arquitectónicas (ADR)

ADR-001 — `src/app/dashboard/page.tsx` es el coordinador oficial del Dashboard del autor.

ADR-002 — Comunicación es independiente del estado editorial.

ADR-003 — Notifications, Messages, Reviews, Timeline, Internal Notes y Proposals son conceptos diferentes y no deben mezclarse artificialmente.

ADR-004 — No se crearán tablas nuevas en Supabase hasta comprobar primero si la infraestructura existente puede reutilizarse.

ADR-005 — Dashboard y Admin pueden tener diseños diferentes aunque compartan servicios, datos o componentes cuando tenga sentido.

ADR-006 — Cada nueva función debe analizarse considerando función, ubicación, sección, diseño, datos, permisos, relaciones, escalabilidad y pruebas.

ADR-007 — No se modifica una decisión arquitectónica existente sin documentar primero la nueva decisión y su motivo.

ADR-008 — La autoridad única del flujo comercial es `acceptProposal()`: una propuesta aceptada crea o vincula el proyecto y establece `projects.proposal_id`. La automatización anterior basada en `project_requests.status = 'accepted'` no puede crear proyectos por separado.

ADR-009 — Las solicitudes aceptadas no se eliminan físicamente al completar el flujo Proposal → Project. Su estado pasa a `accepted`, salen de la bandeja activa y permanecen como antecedente relacional porque `proposals.request_id` depende de ellas mediante FK.

ADR-010 — Las operaciones sensibles de Proposals (`accept`, `send`, `reject`, `expire`) se ejecutan mediante wrappers `SECURITY INVOKER` en el esquema público que delegan la lógica transaccional a `app_private`, con autorización basada en `auth.uid()` y/o administración. No se exponen funciones `SECURITY DEFINER` directamente como API pública.

ADR-011 — El progreso de un proyecto no se deriva de `ProjectStatus` ni de porcentajes sintéticos por estado/capítulo. La fuente autoritativa de `ProjectProgress` es `production_stages` mediante `production-stage.service.ts`; cuando un proyecto no tiene etapas almacenadas, su progreso de dominio es `0` hasta que existan datos reales de producción.

ADR-012 — El Admin no ofrece una vía manual de alta de proyectos fuera del flujo de solicitud/propuesta. La creación de proyectos debe conservar la procedencia del flujo comercial; por ello, la experiencia visible de "Registrar Obra / Manuscrito" se retira del Admin mientras se preservan los servicios legacy necesarios para compatibilidad durante la migración.

ADR-014 — La creación de un Review se ejecuta mediante una RPC transaccional que persiste `reviews` y su evento `review_created` en `timeline` como una sola operación de negocio. Cuando el actor es Admin, la misma operación notifica al autor mediante la tabla existente `notifications`. El modelo actual de `notifications` solo identifica `author_id`, por lo que las notificaciones dirigidas a Admin quedan fuera de este bloque y no se simula un destinatario que el esquema no puede representar.
