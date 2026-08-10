# RoadMap del Proyecto

## Fases Principales

### FASE 1A — Consolidar Dashboard del autor
Estado: COMPLETADA

### FASE 1B — Separación y arquitectura de Comunicación

**1B.1 — Auditoría exhaustiva**
Estado: COMPLETADA

**1B.2 — Modelo funcional y arquitectura de integración**
Estado: APROBADA

#### Subfases de 1B.2:

* 1B2.1 — Diseño funcional de Notificaciones
Estado: COMPLETADA

* 1B2.2 — Diseño funcional de Comunicación
Estado: COMPLETADA

* 1B2.3 — Diseño funcional de Feedback editorial
Estado: COMPLETADA

* 1B2.4 — Diseño funcional de Actividad / Timeline
Estado: COMPLETADA

* 1B2.5 — Diseño funcional de Propuestas
Estado: COMPLETADA

* 1B2.6 — Diseño funcional de Notas internas
Estado: PENDIENTE

* 1B2.7 — Arquitectura cruzada Dashboard/Admin
Estado: PENDIENTE

* 1B2.8 — Revisión global del modelo
Estado: PENDIENTE

### Fases Posteriores

* 1B.3 — Crear/reutilizar componentes
Estado: PENDIENTE

* 1B.4 — Integración en Dashboard
Estado: PENDIENTE

* 1B.5 — Integración en Admin
Estado: PENDIENTE

* 1B.6 — Integración con Supabase
Estado: PENDIENTE

* 1B.7 — Pruebas de integración
Estado: PENDIENTE

* 1B.8 — Revisión final, limpieza y commit
Estado: PENDIENTE

---

## Reglas de trabajo

- No avanzar una fase sin cerrar la anterior.
- No modificar Supabase sin autorización explícita.
- No cambiar el diseño existente salvo que la fase correspondiente lo requiera.
- No borrar componentes sin comprobar todas sus referencias.
- Reutilizar infraestructura existente antes de crear infraestructura nueva.
- Toda decisión arquitectónica importante debe registrarse en ARCHITECTURE_DECISIONS.md.
- Después de cada implementación se debe ejecutar lint y build.
- No hacer commit hasta que yo lo autorice explícitamente.
