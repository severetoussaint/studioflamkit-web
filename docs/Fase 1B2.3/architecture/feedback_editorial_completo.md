# Arquitectura de Feedback Editorial - Fase 1B2.3

Este documento consolida toda la documentación técnica y de diseño para la implementación del módulo de Feedback editorial.

---

## 1B2.3.1 — Auditoría de Feedback Editorial
*Resumen: La capacidad de feedback estaba dispersa entre diversos sistemas (reviews, contacto, notificaciones, timeline). Se identifica `reviews` como la fuente de verdad técnica para feedback estructurado.*

## 1B2.3.2 — Diseño funcional de Feedback editorial
*Decisión principal: El feedback editorial será una sección propia en el Dashboard del autor.*

- **Objetivo**: Estructurar las observaciones sobre entregables de forma persistente.
- **Roles**: Admin crea/gestiona; Autor lee/responde.
- **Relación**: Se integra dentro del proyecto/obra del autor.
- **Experiencia**: Separación clara entre "feedback estructurado" y "conversación libre" (mensajes).

## 1B2.3.3 — Modelo técnico de Feedback editorial
*Infraestructura: Reutilización de la tabla `reviews`.*

- **Modelo**: Aprovechamos el esquema actual de `reviews` (`deliverable_id`, `comment`, `status`, etc.).
- **Independencia**: No se requieren cambios en el esquema actual de la base de datos.
- **Relaciones**: Mantenemos el vínculo con `deliverables` y `projects` para garantizar integridad.

## 1B2.3.4 — Reglas de comportamiento del Feedback editorial
*Reglas clave:*
- **Creación manual**: Solo por parte del Admin.
- **Estados**: `Pendiente`, `Resuelto`, `Descartado`.
- **Comunicación**: La respuesta del autor se redirige al módulo de Mensajes (1B2.2), no se guarda en `reviews.comment`.
- **Notificaciones**: Avisos ante creación o cambio de estado.

## 1B2.3.5 — Especificación de implementación
*Contrato:*
- **Servicio**: Reutilización de `review.service` con operaciones CRUD básicas.
- **UI**: Componentes dedicados (`FeedbackCard`, `FeedbackStatusBadge`, `FeedbackDetail`) compartidos entre Admin y Dashboard.
- **Seguridad**: RLS basado en acceso al proyecto del autor.
- **Orden**: 1. Extracción lógica -> 2. UI -> 3. Integración de flujos -> 4. Pruebas.

---

**Estado final: 1B2.3 — Diseño cerrado.**
Fecha: 2026-08-10.
