# Arquitectura de Comunicación - Fase 1B2.2

Este documento consolida toda la documentación técnica y de diseño para la implementación del módulo de Comunicación.

---

## 1B2.2.1 — Auditoría de Comunicación
*Resumen: La comunicación estaba fragmentada entre notificaciones, soporte, reviews, timeline e internal_notes. No existía un sistema de mensajería persistente.*

## 1B2.2.2 — Diseño funcional de Comunicación
*Decisión principal: Mensajes merece una sección propia en el dashboard. Soporte se separa visualmente pero reutiliza el mismo motor técnico.*

- **Mensajes**: Comunicación persistente entre Autor y Admin.
- **Soporte**: Canal específico para problemas técnicos.
- **Relación con Proyectos**: `project_id` opcional en conversaciones.
- **Seguridad**: RLS estricto por autor/admin.

## 1B2.2.3 — Modelo técnico
*Infraestructura: Creación de tablas `conversations` y `messages`.*

- **conversations**: `id`, `author_id`, `project_id` (nullable), `type`, `subject`, `status`, `created_at`, `updated_at`.
- **messages**: `id`, `conversation_id`, `sender_type`, `sender_id`, `body`, `created_at`, `read_at`.

## 1B2.2.4 — Reglas de eventos y comportamiento
*Reglas clave:*
- Un mensaje es una acción explícita (no generamos conversaciones automáticamente por eventos).
- Respuesta: Crea un nuevo mensaje, no una conversación.
- Notificaciones: Secundaria al mensaje (`messages` -> `notification`).
- Cerrar: `open` -> `closed` (el historial persiste).

## 1B2.2.5 — Especificación de implementación
*Contrato:*
- Implementar `src/services/conversation.service.ts`.
- RLS estricto para acceso de Autor y Admin.
- Orden de implementación definido: DB -> Servicio -> Interfaz -> Integraciones -> Pruebas.

---

**Estado final: 1B2.2 — Diseño cerrado.**
Fecha: 2026-08-10.
