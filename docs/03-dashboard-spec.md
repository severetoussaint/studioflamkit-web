# Studio Flamkit & Art

**Documento:** Dashboard Spec  
**Versión:** 1.0.0  
**Estado:** Activo  
**Propietario:** Producto / UX / Frontend  
**Última actualización:** 2026-08-07

---

## 1. Propósito

Este documento define la especificación funcional y visual del Centro del Autor. Su objetivo es describir con precisión cómo debe comportarse la experiencia principal del autor según el estado real de su proyecto.

Este archivo no define la implementación técnica detallada del código. Define qué debe ver el autor, en qué orden, con qué jerarquía y con qué significado.

---

## 2. Principios del Centro del Autor

### 2.1 Una sola verdad
Toda la información visible debe provenir de la base de datos y de los servicios existentes. No se usan maquetas decorativas ni datos inventados.

### 2.2 Estado antes que decoración
El dashboard debe explicar en qué punto está la obra antes de intentar impresionar visualmente.

### 2.3 Claridad editorial
La interfaz debe sentirse humana, premium y ordenada. El autor debe entender su situación con muy pocas palabras.

### 2.4 Progreso visible
El usuario debe poder ver qué pasó, qué está pasando y qué sigue.

### 2.5 Acción obvia
Cada estado debe proponer una única acción principal o dejar claro que no hay acción requerida.

---

## 3. Arquitectura de la pantalla

La vista principal del Centro del Autor debe organizarse en este orden:

1. Header
2. Sidebar
3. Hero principal
4. Estado del proyecto
5. CTA dominante
6. Timeline / stepper
7. KPIs compactos
8. Resumen editorial y comercial
9. Soporte directo
10. Panel de archivos
11. Alertas / hitos
12. Contenido secundario

Esta jerarquía puede variar ligeramente entre estados, pero el principio general no cambia.

---

## 4. Estados del Centro del Autor

La pantalla debe adaptarse automáticamente al estado real del autor.

### 4.1 Estado `none`
El autor no ha enviado manuscrito.

### 4.2 Estado `pending`
El manuscrito fue recibido y está en evaluación.

### 4.3 Estado `active`
El proyecto fue aprobado y está en producción.

La interfaz debe cambiar de personalidad entre estos tres estados sin romper la estructura base del sitio.

---

## 5. Estado `none`

### 5.1 Objetivo
Invitar al autor a enviar su manuscrito de forma clara, confiable y elegante.

### 5.2 Hero principal
Debe ocupar el centro visual y contener:
- título editorial,
- subtítulo humano,
- CTA principal para enviar manuscrito,
- una breve explicación del proceso.

### 5.3 Elementos secundarios
- tres pasos del proceso,
- bloque de confianza,
- breve explicación de tiempos de respuesta,
- recordatorio de que no hay compromiso hasta la evaluación.

### 5.4 Qué no debe existir
- timelines vacíos,
- métricas inventadas,
- archivos bloqueados,
- datos de proyecto inexistente.

---

## 6. Estado `pending`

Este es el estado más sensible emocionalmente. El autor ya envió su obra y necesita calma, claridad y orientación.

### 6.1 Objetivo
Confirmar que el manuscrito fue recibido y explicar qué sigue.

### 6.2 Hero de confirmación
La tarjeta principal debe mostrar:
- icono de notificación desbloqueada o confirmación,
- mensaje de bienvenida,
- fecha real de recepción,
- subtítulo tranquilizador,
- CTA secundario o ghost para ver archivos enviados.

### 6.3 Carrusel de 3 imágenes
Debe mostrarse un carrusel informativo con imágenes 3:2 ubicadas en:
- `public/media/onboarding/step-1.jpg`
- `public/media/onboarding/step-2.jpg`
- `public/media/onboarding/step-3.jpg`

Cada imagen debe explicar de forma muy simple:
1. el manuscrito fue recibido,
2. está en evaluación,
3. esto es lo que pasará después.

### 6.4 Timeline
Debe mostrar la ruta general del proceso editorial.  
Etapas sugeridas:
- Recibido
- En análisis
- Propuesta
- Producción
- Revisión
- Entrega final

La etapa activa debe destacarse visualmente. Las completadas deben mostrar checkmark o estado equivalente.

### 6.5 Mini panel de archivos
Debe mostrar:
- nombre del archivo,
- peso,
- fecha de envío,
- estado de bloqueo,
- nota sobre cuándo se habilita la gestión de archivos.

Mientras el proyecto esté en evaluación, este panel debe comunicar que la interacción con archivos está limitada.

### 6.6 Resumen editorial y comercial
Debe mostrar lo esencial:
- nombre del manuscrito,
- número de palabras,
- formato recibido,
- complejidad estimada,
- alcance general,
- observaciones iniciales,
- estado del siguiente paso.

### 6.7 CTA dominante
Debe ser un botón claro basado en el estado real.  
Ejemplos:
- Esperar evaluación
- Revisar propuesta
- Completar pago
- Responder observaciones

### 6.8 Alertas e hitos
Debe haber un panel pequeño que explique si falta algo importante:
- revisión pendiente,
- aprobación pendiente,
- propuesta aún por revisar,
- pago pendiente.

### 6.9 Bloque de rechazo posible
Debe existir una nota clara y breve que explique que un manuscrito puede ser rechazado si no cumple criterios mínimos como:
- formato ilegible,
- extensión insuficiente,
- idioma no compatible,
- archivo corrupto o incompleto.

El texto debe ser humano y respetuoso.

---

## 7. Estado `active`

Una vez activo, el Centro del Autor debe transformarse en una vista operativa viva del proyecto.

### 7.1 Objetivo
Mostrar avance real, producción actual, próximos pasos y soporte, sin saturar al usuario.

### 7.2 Hero principal
Debe mostrar:
- título del manuscrito o proyecto,
- estado de producción,
- chip visual de estado,
- progreso general real,
- mensaje contextual breve.

### 7.3 KPIs compactos
Deben resumir datos clave como:
- progreso general,
- capítulos o unidades activas,
- duración estimada,
- próximas acciones,
- revisiones usadas,
- entregables pendientes o completados.

### 7.4 Sección de capítulos o unidades
Debe mostrar cada capítulo como una tarjeta individual con:
- número,
- título,
- duración estimada,
- precio,
- estado,
- barra de progreso,
- etiqueta contextual.

### 7.5 Panel de entregables
Debe listar archivos o entregables reales con:
- nombre,
- fecha,
- estado completado o pendiente,
- prioridad visual suave.

### 7.6 Próximos pasos
Debe existir un bloque de acción que indique lo siguiente que debe hacer el autor.  
Ejemplos:
- revisar observaciones,
- responder mensaje,
- aprobar propuesta,
- completar pago,
- esperar producción.

### 7.7 Soporte
Debe incluir:
- productor asignado,
- contacto directo,
- tiempo de respuesta estimado,
- acceso rápido al canal de ayuda.

### 7.8 Timeline
Debe seguir siendo visible y debe reflejar el punto exacto del proceso.

### 7.9 Alertas
Solo deben aparecer si existe una acción real o una decisión pendiente.

---

## 8. Resumen editorial y comercial

Esta sección vive tanto en `pending` como en `active`, aunque cambia su contenido.

Debe mostrar información útil sin lenguaje técnico duro.

### 8.1 Campos deseables
- nombre del manuscrito,
- palabras totales,
- formato recibido,
- duración estimada del audiolibro,
- complejidad del proyecto,
- alcance general,
- observaciones iniciales,
- estado del siguiente paso,
- etiqueta o chip contextual.

### 8.2 Reglas
- No usar jerga de backend.
- No mostrar complejidad si no ayuda al autor.
- No llenar espacio con datos irrelevantes.
- El bloque debe funcionar como una síntesis ejecutiva.

---

## 9. Panel de archivos

### 9.1 Propósito
Permitir al autor ver qué documentos se han subido y cuál es su estado.

### 9.2 Campos
- nombre del archivo,
- peso,
- fecha de carga,
- acción posible,
- estado de bloqueo o disponibilidad.

### 9.3 Estados
- bloqueado,
- disponible,
- reemplazable,
- en revisión,
- aprobado.

### 9.4 Reglas
- Si el proyecto aún no fue aprobado, la edición de archivos debe estar limitada.
- Si el proyecto ya está activo, el panel puede mostrar reemplazos o entregables vinculados.

---

## 10. Timeline / stepper

### 10.1 Función
Debe servir para que el autor siempre sepa en qué etapa está su obra.

### 10.2 Estados visuales
- completado
- activo
- pendiente
- bloqueado

### 10.3 Reglas
- Debe leerse en pocos segundos.
- Debe ser consistente entre `pending` y `active`.
- Debe adaptarse al estado real del proyecto.

### 10.4 Lenguaje
Se prefieren nombres claros y editoriales, por ejemplo:
- Recibido
- En análisis
- Propuesta en preparación
- Producción
- Revisión
- Entrega final

---

## 11. KPIs compactos

### 11.1 Propósito
Dar información resumida sin ruido.

### 11.2 Ejemplos
- progreso general,
- capítulos activos,
- revisiones usadas,
- próximo entregable,
- duración estimada,
- estado de siguiente acción.

### 11.3 Reglas
- No usar más de 1 idea principal por tarjeta.
- No convertir los KPIs en un bloque pesado de analítica.
- Los KPIs deben ser útiles, no ornamentales.

---

## 12. Hero principal

### 12.1 Comportamiento
El hero debe cambiar según el estado real del proyecto.

### 12.2 En `none`
Invita a enviar manuscrito.

### 12.3 En `pending`
Confirma recepción y muestra que el equipo ya está revisando.

### 12.4 En `active`
Resume el avance real y el siguiente paso operativo.

### 12.5 Reglas
- Debe ser la tarjeta más importante de la pantalla.
- Debe contener una acción o una conclusión clara.
- No debe saturarse con demasiada información.

---

## 13. Bloque de confianza

Debe existir en toda experiencia relevante para reforzar la seguridad del autor.

### Puede incluir:
- productor asignado,
- respuesta en 48h,
- proceso artesanal,
- seguimiento editorial,
- soporte directo.

### Reglas
- Debe sentirse humano.
- No debe sonar a marketing vacío.
- Debe reforzar la tranquilidad del autor.

---

## 14. Soporte directo

### 14.1 Propósito
Dar acceso inmediato a ayuda si el autor la necesita.

### 14.2 Debe incluir
- contacto directo,
- canal de mensajería,
- tiempo de respuesta,
- botón claro de acceso.

### 14.3 Reglas
- Siempre visible cuando el contexto lo justifique.
- Nunca invasivo.
- Nunca más importante que el estado del proyecto.

---

## 15. Alertas e hitos

### 15.1 Propósito
Indicar situaciones que requieren atención real.

### 15.2 Ejemplos
- revisión pendiente,
- pago pendiente,
- propuesta pendiente,
- observación del productor,
- archivo incompleto.

### 15.3 Reglas
- Solo mostrar alertas reales.
- No inflar el panel con avisos redundantes.
- La alerta debe tener una acción o implicación clara.

---

## 16. Lenguaje visual

El dashboard debe hablar como una editorial premium:
- calmado,
- preciso,
- elegante,
- humano,
- profesional.

Debe evitar:
- frases técnicas innecesarias,
- lenguaje demasiado corporativo,
- densidad visual excesiva,
- diseños que parezcan CRM o admin genérico.

---

## 17. Qué no debe ocurrir

- No mostrar datos inventados.
- No crear gráficos decorativos sin utilidad.
- No mostrar secciones vacías como si fueran contenido real.
- No mezclar demasiadas jerarquías visuales al mismo nivel.
- No usar tonos visuales fríos como base de marca.
- No convertir la pantalla en una pared de información.

---

## 18. Criterios de éxito

La pantalla funciona bien cuando un autor puede:
1. entender dónde está su proyecto,
2. saber qué cambió desde la última vez,
3. saber si debe hacer algo,
4. contactar soporte si hace falta,
5. sentir que el proceso es serio y confiable.

---

## 19. Conclusión

El Centro del Autor debe sentirse como un espacio vivo, editorial y premium donde cada estado cuenta una historia clara.  
La prioridad no es mostrar más cosas. La prioridad es mostrar lo correcto, en el orden correcto y con el tono correcto.
