# Studio Flamkit & Art

**Documento:** Roadmap  
**Versión:** 1.0.0  
**Estado:** Activo  
**Propietario:** Producto / Ingeniería Frontend  
**Última actualización:** 2026-08-07

---

## 1. Propósito

Este documento define la hoja de ruta inicial para convertir la documentación y la base técnica actual en un Centro del Autor premium, coherente y conectado a datos reales.

No es una lista de deseos.  
Es un plan de ejecución por hitos, con foco en riesgo controlado, validación continua y consistencia de producto.

---

## 2. Objetivo general

Construir un Centro del Autor que:

- refleje estados reales del proyecto,
- se conecte correctamente con Supabase,
- no rompa la lógica existente,
- tenga una experiencia editorial y premium,
- y permita crecer hacia mensajería, pagos, revisiones, notificaciones y entregables.

---

## 3. Principios de ejecución

### 3.1 Primero la base, luego el diseño
No se rediseña sin entender la arquitectura.

### 3.2 Una fase, un objetivo
Cada hito debe resolver una sola clase de problema.

### 3.3 No inventar
Nada de mocks ficticios para “rellenar” la interfaz.

### 3.4 Validar antes de avanzar
Cada cambio importante debe pasar por TypeScript, revisión visual y verificación de comportamiento real.

### 3.5 Mantener compatibilidad
La implementación debe respetar los servicios y estados actuales.

---

## 4. Hitos del roadmap

## Hito 1 — Fundación documental
Estado: completado / en progreso según el uso interno.

### Entregables
- `00-project-vision.md`
- `01-architecture.md`
- `02-design-system.md`
- `03-dashboard-spec.md`
- `04-gemini-rules.md`
- `05-roadmap.md`

### Resultado esperado
Tener una fuente de verdad clara para producto, diseño, arquitectura y reglas de IA.

---

## Hito 2 — Auditoría técnica del Centro del Autor

### Objetivo
Confirmar qué existe realmente en:
- `src/app/dashboard/page.tsx`
- `src/services/`
- `src/components/`
- `src/providers/`
- `src/lib/`
- `src/types/`
- `supabase/migrations/`

### Resultado esperado
Un mapa real de dependencias, servicios, estados y componentes para que Gemini no improvise.

### Riesgo que reduce
Evitar reescrituras innecesarias o destrucción accidental de lógica funcional.

---

## Hito 3 — Sistema visual base

### Objetivo
Alinear el producto con el lenguaje visual editorial y premium definido en el design system.

### Entregables
- tokens de color y tipografía consolidados,
- tarjetas consistentes,
- botones y chips uniformes,
- iconografía alineada,
- sombras y bordes coherentes,
- motion sutil.

### Resultado esperado
Un estilo visual estable que no cambie por pantalla o por autor.

---

## Hito 4 — Centro del Autor: estado `none`

### Objetivo
Diseñar la experiencia para autores sin manuscrito enviado.

### Incluye
- hero de bienvenida,
- CTA principal para enviar manuscrito,
- explicación simple del proceso,
- pasos iniciales,
- bloque de confianza.

### Resultado esperado
Una pantalla clara, acogedora y enfocada en la acción de envío.

---

## Hito 5 — Centro del Autor: estado `pending`

### Objetivo
Diseñar la experiencia cuando el manuscrito ya fue recibido y está en evaluación.

### Incluye
- hero de confirmación,
- fecha de recepción real,
- carrusel 3:2 con imágenes explicativas,
- timeline editorial,
- panel de archivos bloqueados,
- resumen editorial y comercial,
- CTA dominante según el estado real,
- alertas/hitos cuando aplique.

### Resultado esperado
Una vista viva del proceso que reduzca ansiedad y aumente confianza.

---

## Hito 6 — Centro del Autor: estado `active`

### Objetivo
Diseñar la experiencia para proyectos en producción.

### Incluye
- hero de proyecto activo,
- progreso general real,
- KPIs compactos,
- capítulos/unidades de producción,
- entregables,
- próximas acciones,
- soporte directo,
- timeline actualizado.

### Resultado esperado
Una vista de trabajo real, clara y premium, sin saturación técnica.

---

## Hito 7 — Componentización

### Objetivo
Extraer bloques repetibles del dashboard en componentes reutilizables.

### Componentes probables
- `StatusHero`
- `ProgressTimeline`
- `KpiCard`
- `SupportPanel`
- `FilePanel`
- `NextActionCard`
- `NotificationBell`

### Resultado esperado
Menos duplicación, más consistencia y mejor mantenibilidad.

---

## Hito 8 — Microinteracciones y motion

### Objetivo
Añadir refinamiento visual sin distraer.

### Incluye
- hover sutil,
- transiciones de estado,
- animación de entrada suave,
- feedback visual en botones y tarjetas,
- interacción elegante para carrusel y timeline.

### Resultado esperado
Una interfaz más viva, pero todavía silenciosa y premium.

---

## Hito 9 — Responsive y accesibilidad

### Objetivo
Asegurar que el Centro del Autor funcione y se entienda en desktop, tablet y móvil.

### Incluye
- reordenamiento en pantallas pequeñas,
- lectura clara del estado,
- CTA accesible,
- soporte para navegación cómoda,
- jerarquía mantenida.

### Resultado esperado
Una experiencia consistente en todos los dispositivos.

---

## Hito 10 — QA y estabilización

### Objetivo
Verificar que el rediseño no rompe nada importante.

### Incluye
- `npx tsc --noEmit`,
- revisión de imports,
- verificación de servicios,
- control de regresiones,
- validación visual,
- revisión de rutas críticas.

### Resultado esperado
Una versión sólida y lista para seguir evolucionando.

---

## 5. Próxima evolución funcional

Una vez el Centro del Autor esté sólido, la plataforma puede crecer hacia:

- mensajería interna,
- notificaciones reales,
- pagos y facturación,
- revisiones editoriales,
- entregables por proyecto,
- panel del productor,
- soporte directo,
- y eventualmente automatizaciones más avanzadas.

---

## 6. Prioridad de trabajo

Orden recomendado para implementación:

1. arquitectura real,
2. sistema visual,
3. estados del Centro del Autor,
4. componentes reutilizables,
5. motion y refinamiento,
6. responsive,
7. QA final.

---

## 7. Conclusión

Este roadmap mantiene la ambición del producto bajo control.

La meta no es lanzar muchas pantallas rápidamente.  
La meta es construir una base de producto coherente, real y escalable, capaz de sostener Studio Flamkit & Art durante mucho tiempo.
