# Studio Flamkit & Art

**Documento:** Gemini Rules  
**Versión:** 1.0.0  
**Estado:** Activo  
**Propietario:** Producto / Ingeniería Frontend  
**Última actualización:** 2026-08-07

---

## 1. Propósito

Este documento define las reglas de trabajo que deben seguir las herramientas de IA, especialmente Gemini, cuando generen, modifiquen o refactoricen código para Studio Flamkit & Art.

Su objetivo es proteger la arquitectura, evitar regresiones y asegurar que cualquier cambio respete la visión del producto, el sistema visual y la lógica real de negocio.

---

## 2. Regla principal

### La base de datos y los servicios existentes son la fuente de verdad.
No se deben inventar estados, métricas, listas, timelines, archivos, notificaciones ni datos de ejemplo para “rellenar” la interfaz.

Si algo no existe en la base de datos o en el servicio real, no se muestra como si fuera verdadero.

---

## 3. Alcance de Gemini

Gemini puede ayudar a:
- rediseñar JSX,
- reorganizar layout,
- mejorar estilos Tailwind,
- crear componentes visuales,
- implementar microinteracciones,
- crear componentes reutilizables,
- proponer refactor visual,
- mejorar accesibilidad.

Gemini no puede:
- reescribir la arquitectura completa sin instrucciones,
- eliminar lógica funcional existente,
- reemplazar servicios reales por mocks,
- inventar datos,
- duplicar estados,
- cambiar contratos de Supabase,
- alterar nombres de funciones críticas sin necesidad.

---

## 4. Reglas absolutas

### 4.1 No inventar datos
Prohibido crear:
- arrays ficticios,
- KPIs simulados,
- gráficas decorativas sin origen,
- listas inventadas,
- timelines estáticos sin conexión,
- mensajes de sistema falsos.

### 4.2 No romper servicios
Prohibido eliminar o renombrar:
- llamadas a `getUser`,
- llamadas a `getAuthorRequestState`,
- llamadas a `getAuthorProjectData`,
- llamadas a `submitManuscript`,
- cualquier función de autenticación o carga real.

### 4.3 No duplicar estado
Prohibido declarar nuevas versiones paralelas de:
- `requestState`,
- `authorId`,
- `isChecking`,
- `projectData`,
- cualquier estado que ya exista y funcione.

### 4.4 No tocar la lógica crítica
No modificar sin autorización explícita:
- autenticación,
- sesión,
- Supabase,
- carga de proyecto,
- envío de manuscrito,
- rutas críticas,
- validaciones de negocio.

### 4.5 No introducir dependencias innecesarias
Antes de añadir una librería nueva, verificar si ya existe una equivalente instalada o si el proyecto puede resolverse con lo que ya tiene.

---

## 5. Qué sí debe hacer Gemini

Gemini debe enfocarse en:
- estructura visual,
- orden del contenido,
- jerarquía editorial,
- consistencia de espaciado,
- estados UI,
- componentes reutilizables,
- mejoras de presentación,
- diseño responsive,
- motion sutil.

---

## 6. Filosofía de implementación

### 6.1 Menos sorpresa, más precisión
El código generado debe ser predecible y fácil de integrar.

### 6.2 Un solo propósito por cambio
Cada prompt debe pedir una sola cosa importante.

### 6.3 Mantener compatibilidad
Si un archivo ya funciona, Gemini no debe romper su contrato interno.

### 6.4 Cambios por capas
Primero layout, luego componentes, luego microinteracciones, luego refinamiento.

---

## 7. Reglas para `src/app/dashboard/page.tsx`

Este archivo es crítico.

### Gemini debe:
- conservar la lógica existente,
- respetar el flujo de autenticación,
- mantener la carga de request state y project data,
- rediseñar la UI sin destruir el comportamiento.

### Gemini no debe:
- recrear desde cero el flujo del dashboard,
- borrar modales funcionales,
- cambiar nombres de handlers sin razón,
- crear datos falsos para “ver bonito”,
- reemplazar el estado real por demo content.

---

## 8. Reglas para estados del Centro del Autor

### Estado `none`
Debe mostrar invitación a subir manuscrito.  
No debe mostrar proyecto activo ni datos inventados.

### Estado `pending`
Debe mostrar confirmación real de recepción, estado de evaluación y explicación del siguiente paso.

### Estado `active`
Debe mostrar el proyecto en producción con datos reales, capítulos reales, entregables reales y próximos pasos reales.

---

## 9. Reglas para componentes nuevos

Si Gemini crea un componente nuevo:
- debe tener nombre descriptivo,
- debe ser reutilizable,
- debe recibir props claros,
- no debe acoplarse a lógica de negocio si es un componente visual,
- debe usar el sistema visual oficial.

Ejemplos de componentes útiles:
- `StatusHero`
- `ProgressTimeline`
- `KpiCard`
- `SupportPanel`
- `FilePanel`
- `NotificationBell`
- `NextActionCard`

---

## 10. Reglas de estilo

### 10.1 Visual
- No usar bordes oscuros.
- No usar sombras fuertes.
- No usar colores fríos dominantes.
- No usar estilos de CRM genérico.

### 10.2 Tipografía
- Títulos con serif editorial.
- Texto con sans legible.
- Jerarquía clara y consistente.

### 10.3 Espaciado
- Mucho aire.
- Tarjetas amplias.
- Layout limpio.
- Nada pegado.

### 10.4 Iconografía
- Outline.
- Lucide preferentemente.
- Siempre coherente con el sistema visual.

---

## 11. Reglas de motion

- Animaciones discretas.
- Duración corta.
- Ease-out.
- Sin rebotes exagerados.
- Sin efectos llamativos innecesarios.

---

## 12. Reglas de QA antes de entregar código

Gemini debe validar mentalmente o por instrucciones explícitas:

- que TypeScript no se rompa,
- que no haya imports eliminados por error,
- que no existan estados duplicados,
- que no haya datos mock disfrazados de reales,
- que el layout siga el orden acordado,
- que el código siga siendo copiable al proyecto sin reestructurar media app.

Si el prompt pide verificar TypeScript o lint, la respuesta debe incluir los pasos y esperar el resultado real.

---

## 13. Instrucciones de lectura obligatoria antes de modificar

Antes de tocar código, Gemini debe leer:

1. `docs/00-project-vision.md`
2. `docs/01-architecture.md`
3. `docs/02-design-system.md`
4. `docs/03-dashboard-spec.md`
5. Este documento.

Si hay conflicto entre el prompt y la documentación, la documentación gana.

---

## 14. Qué hacer cuando hay ambigüedad

Si una instrucción está incompleta:
- no inventar,
- no asumir datos,
- no llenar huecos con ejemplos falsos,
- pedir una especificación más clara o resolver solo la parte visual segura.

---

## 15. Formato recomendado para prompts de Gemini

Cada prompt debe incluir:

- objetivo único,
- archivos permitidos,
- archivos prohibidos,
- reglas de diseño,
- reglas de lógica,
- criterios de aceptación,
- comando de validación si aplica.

---

## 16. Criterios para aceptar el resultado

Un cambio se considera correcto si:
- se ve mejor,
- sigue funcionando,
- no inventó datos,
- respeta Supabase,
- mantiene la experiencia editorial,
- es más claro para el autor,
- y no rompe la arquitectura existente.

---

## 17. Conclusión

Gemini debe actuar como una herramienta de implementación guiada, no como una fuente de decisión del producto.

La documentación manda.
La base de datos manda.
La lógica existente manda.

La IA solo construye dentro de esos límites.
