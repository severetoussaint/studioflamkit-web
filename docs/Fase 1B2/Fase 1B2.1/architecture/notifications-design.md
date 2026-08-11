# 1B2.1 — Diseño y especificación de Notificaciones

## Estado actual
EN CURSO

## 1. Auditoría
### Lo que existe de verdad hoy
Hay una base real de notificaciones en `src/services/notification.service.ts`: lee de la tabla `notifications`, filtra por `author_id`, y permite marcar una notificación o todas como leídas. Eso no es decorativo; es un canal funcional de avisos del sistema. 

La campana del navbar ya consume ese servicio. `src/components/layout/Navbar.tsx` solo activa las notificaciones en rutas de dashboard/admin para usuarios autenticados, calcula el badge de no leídas y muestra un panel desplegable con acciones de lectura. 

### Lo que no es notificación, aunque se le parezca
`SupportPanel` no es un sistema de mensajes: es un bloque de acompañamiento editorial que, según el caso, abre un modal o envía a `mailto:`. En `/dashboard`, hoy ese botón manda a `/contacto`, así que funciona como puerta de soporte, no como conversación persistente. 

`src/app/contacto/page.tsx` sí existe como formulario separado, pero no hay persistencia real en Supabase ni un hilo conversacional por obra. La página habla de “primera conversación” y “propuesta orientativa”, así que hoy es más captación/contacto que mensajería estructurada. 

### Lo que sí existe, pero pertenece a otras familias
`reviews` se usa para comentarios sobre entregables, con `deliverable_id`, `comment` y `status: 'open'`, así que eso es feedback editorial de pieza, no chat general. `internal_notes` existe y está ligado a `projects` y `authors`, pero es claramente interno. `timeline` es historial de eventos del proyecto. `proposals` está unido a `project_requests` y sirve para la propuesta/cotización, no para mensajería. 

### Lo que confirmé en Supabase
En el esquema vivo del proyecto existen estas tablas y relaciones: `notifications`, `timeline`, `internal_notes`, `reviews`, `proposals`, `project_requests`, `projects`, `manuscripts` y `authors`. También confirmé que `notifications` está vacía ahora mismo, y que hay políticas RLS para lectura/escritura diferenciadas entre autor y admin. Eso es importante: el soporte de datos ya existe, pero todavía no hay un módulo de “mensajes” como tal.  

### Conclusión
La clasificación correcta hoy es esta:
- **Notificaciones** → avisos del sistema, ya funcionales.
- **Support / contacto** → comunicación inicial, no chat persistente.
- **Reviews** → feedback editorial sobre entregables.
- **Internal notes** → administración interna.
- **Timeline** → actividad/historial.
- **Proposals** → propuesta comercial/editorial.

## 2. Diseño funcional aprobado
# — Diseño funcional de Notificaciones

## 1. Objetivo
Convertir el sistema actual de notificaciones en un canal coherente para **avisos accionables del sistema**, sin mezclarlo con:

- conversaciones;
- revisiones editoriales;
- timeline;
- notas internas;
- propuestas.
La notificación debe responder principalmente:

> **“¿Qué ocurrió y qué debería mirar?”**
No debe intentar explicar toda la situación ni convertirse en una conversación.

---

# 2. Modelo de una notificación
Conceptualmente:

```
Notificación
├── quién la recibe
├── qué ocurrió
├── cuándo ocurrió
├── qué entidad la originó
├── prioridad
├── leída / no leída
└── acción opcional
```
La acción es especialmente importante.

Por ejemplo:

> **Nueva revisión disponible**
> Tu entrega del capítulo 3 tiene una observación pendiente.
> **[Ver revisión]**
La notificación no contiene toda la revisión. Lleva al usuario hacia ella.

---

# 3. Tipos de notificación
Propongo inicialmente seis categorías:

### 📝 Editorial
Ejemplos:

- nueva revisión disponible;
- revisión actualizada;
- corrección solicitada;
- corrección aprobada.

### 📄 Archivos

- archivo recibido;
- archivo rechazado;
- nuevo entregable disponible;
- archivo actualizado.

### 📖 Obra / producción

- manuscrito recibido;
- análisis iniciado;
- producción iniciada;
- producción completada.

### 💰 Propuesta / comercial

- propuesta disponible;
- propuesta actualizada;
- propuesta aceptada;
- propuesta rechazada.

### 💬 Comunicación
Solamente para eventos relacionados con el futuro sistema de comunicación.

Ejemplo:

> Nuevo mensaje del equipo editorial.
**No crearíamos mensajes directamente dentro de `notifications`.**

### ⚙️ Sistema
Eventos excepcionales:

- cambios importantes de cuenta;
- problemas de procesamiento;
- acciones administrativas relevantes.

---

# 4. Destinatarios
Aquí debemos ser muy estrictos.

## Autor
Recibe únicamente eventos relacionados con:

- sus obras;
- sus manuscritos;
- sus archivos;
- sus revisiones;
- sus propuestas;
- sus conversaciones;
- su cuenta.
Nunca recibe:

- `internal_notes`;
- información de otro autor;
- actividad interna de Admin.

## Admin
Recibe eventos operativos:

- nuevo manuscrito;
- nueva solicitud;
- autor respondió;
- nueva revisión;
- nueva conversación;
- archivos pendientes;
- acciones que requieren atención.
Esto permite que Admin tenga una bandeja realmente útil.

---

# 5. Prioridad
No todas las notificaciones deben pesar igual.

Propongo tres niveles:

### Informativa

```
ℹ️
Manuscrito recibido correctamente.
```
No requiere acción inmediata.

### Atención

```
🟡
Nueva revisión disponible.
```
Conviene actuar, pero no es urgente.

### Importante

```
🔴
La propuesta requiere una respuesta.
```
Debe llamar claramente la atención.

Esto nos permitirá posteriormente ordenar o filtrar notificaciones sin cambiar el modelo.

---

# 6. Acción de la notificación
Una notificación puede tener una acción.

Ejemplos:

EventoAcciónNueva revisiónVer revisiónNuevo entregableVer archivoPropuesta disponibleVer propuestaNuevo mensajeAbrir conversaciónManuscrito recibidoVer obraSolicitud nuevaAbrir solicitud

Y si no existe una pantalla adecuada todavía, la notificación puede ser inicialmente informativa.

**No debemos inventar rutas solo para darle una acción.**

---

# 7. Dashboard del autor
Mantendría la campana existente.

No necesitamos añadir inmediatamente otra sección enorme.

### Estado normal

```
🔔
```

### Con pendientes

```
🔔 3
```

### Panel

```
┌─────────────────────────────────┐
│ Notificaciones             ✓    │
├─────────────────────────────────┤
│ 🔴 Propuesta disponible         │
│ Tu propuesta está lista.        │
│ Hace 20 min              Ver →  │
├─────────────────────────────────┤
│ 🟡 Nueva revisión               │
│ Capítulo 3 requiere atención.   │
│ Hace 2 h                 Ver →  │
├─────────────────────────────────┤
│ ℹ️ Manuscrito recibido          │
│ Hemos recibido tu manuscrito.   │
│ Ayer                     Ver →  │
├─────────────────────────────────┤
│ Ver todas                       │
└─────────────────────────────────┘
```

### Importante
No quiero reemplazar visualmente la Navbar actual.

La intención es **evolucionar lo que ya existe**, no crear una segunda navegación.

---

# 8. Centro de notificaciones
No lo implementaría todavía como obligatorio.

Pero dejamos preparado el concepto:

`/dashboard/notificaciones`

Cuando haya suficientes notificaciones para justificarlo:

```
Notificaciones

[ Todas ] [ No leídas ]

🔴 Propuesta
🟡 Revisión
📄 Archivo
ℹ️ Sistema
```
Esto evita sobrecargar el dropdown.

---

# 9. Admin
Aquí sí quiero una experiencia diferente.

Admin necesita saber:

> **“¿Qué requiere mi atención?”**
Por eso su panel puede tener:

```
Notificaciones

🔴 Requieren atención       3

Nueva solicitud
Carlos — Mi novela
Hace 5 min

Autor respondió
María — Capítulo 4
Hace 20 min

Revisión pendiente
Pedro — Entrega final
Hace 1 h
```
Y debajo:

```
Actividad reciente
────────────────────
...
```
Pero **Actividad y Notificaciones seguirán siendo sistemas distintos**.

---

# 10. Agrupación
Esto será importante cuando crezca el proyecto.

Supongamos que un proceso genera:

```
Archivo recibido
Análisis iniciado
Análisis terminado
Revisión creada
```
No necesariamente queremos bombardear al autor con cuatro avisos.

Más adelante podemos agrupar:

> **Tu manuscrito avanzó en el proceso editorial.**
Pero inicialmente recomiendo **no implementar agrupación automática**.

Primero necesitamos que los eventos sean correctos.

---

# 11. Duplicados
Una regla importante:

El mismo evento no debe generar repetidamente la misma notificación por un re-render, refresh o retry.

La arquitectura deberá distinguir:

```
evento ocurrido
        ↓
notificación creada
        ↓
usuario la lee
```
No:

```
usuario recarga
↓
se vuelve a crear
↓
otra notificación
↓
otra notificación
```
Esto será parte de las pruebas.

---

# 12. Relación con las seis fases editoriales
Aquí hay que ser cuidadosos.

Una notificación puede decir:

> **Tu obra pasó a Producción.**
Pero **la notificación no decide que la obra esté en Producción**.

La fuente de verdad del estado será el modelo editorial que estamos definiendo en paralelo.

Es decir:

```
Estado maestro
      ↓
evento de cambio
      ↓
notificación
```
Nunca:

```
notificación
      ↓
cambio de estado
```
Esto evita una enorme cantidad de problemas de sincronización.

---

# 13. Supabase
La auditoría mostró algo muy favorable:

**ya existe `notifications` y ya existen políticas RLS.**

Por tanto, nuestra primera opción será:

> **reutilizar la tabla existente.**
No propongo crear otra tabla de notificaciones.

Primero debemos revisar exactamente sus columnas y cómo se están generando los registros antes de modificar nada.

---

# 14. Componentes que probablemente reutilizaremos
Ya tenemos:

- servicio de notificaciones;
- campana;
- contador;
- dropdown;
- marcado individual;
- marcado global.
Por tanto, **no vamos a reconstruir el sistema desde cero**.

La posible evolución sería:

```
NotificationBell
        ↓
NotificationPanel
        ↓
NotificationItem
        ↓
acción
```
Pero esto se decidirá durante **1B.3**, cuando lleguemos a componentes.

---

# 15. Lo que NO vamos a hacer en 1B2.1
No vamos a:

- crear un sistema de chat;
- crear tablas nuevas innecesariamente;
- meter reviews dentro de notifications;
- meter timeline dentro de notifications;
- exponer notas internas;
- cambiar la ruta editorial;
- modificar el diseño general del Dashboard;
- crear una página de notificaciones porque sí;
- generar notificaciones para cada pequeño cambio interno.

---

# 16. Resultado esperado
Cuando terminemos la implementación, la experiencia debería ser:

### Autor

> 🔔 **Tengo algo que debería mirar.**
Hace clic.

> **Entiendo qué pasó.**
Hace clic.

> **Estoy directamente en el lugar donde puedo actuar.**

### Admin

> 🔔 **Tengo algo que requiere atención.**
Hace clic.

> **Sé qué autor/obra está involucrado.**
Hace clic.

> **Voy directamente a la tarea correspondiente.**
Eso convierte las notificaciones de un simple contador de mensajes en un **sistema de navegación contextual**.

---

## Estado de 1B2.1
Con esto tendríamos:

**1B2.1.1 — Auditoría:** ✅
**1B2.1.2 — Diseño funcional:** 🟡 presentado para aprobación
**1B2.1.3 — Modelo técnico:** ⏳
**1B2.1.4 — Reglas de eventos:** ⏳
**1B2.1.5 — Preparación para componentes:** ⏳  

**No implementaría nada todavía hasta que apruebes este diseño.**

## 3. Modelo técnico aprobado
# — Modelo técnico de Notificaciones

### Objetivo técnico
Traducir el diseño aprobado a una estructura estable que permita:

- generar notificaciones sin duplicarlas;
- mostrar notificaciones al autor y a Admin;
- enlazarlas con la entidad correcta;
- reutilizar la tabla existente `notifications` si alcanza;
- evitar mezclar notificación con mensaje, revisión o timeline.

---

### 1. Fuente de verdad
La tabla base seguirá siendo:

`notifications`

Porque ya existe, ya tiene RLS y ya está integrada en el navbar.

---

### 2. Estructura técnica mínima
Cada notificación debería poder representar:

- `id`
- `author_id`
- `title`
- `message`
- `status`
- `created_at`
Y además, a nivel funcional, necesitamos conceptualizar estos datos aunque hoy no todos existan como columnas:

- `type` o categoría funcional
- `priority`
- `entity_type`
- `entity_id`
- `action_url` o destino equivalente
- `source_event`
- `dedupe_key`

---

### 3. Campos que ya existen
En el esquema actual ya tenemos:

- `id`
- `author_id`
- `title`
- `message`
- `status`
- `created_at`
Eso significa que el modelo actual ya soporta una notificación simple.

---

### 4. Lo que falta conceptualmente
Hoy no vimos columnas para distinguir con precisión:

- si es revisión, archivo, propuesta, sistema, comunicación, etc.;
- a qué obra/manuscrito/capítulo/revisión apunta;
- qué prioridad tiene;
- si tiene acción directa;
- qué evento la originó;
- cómo evitar duplicados.
Eso no significa que haya que cambiar la base ya mismo, pero sí significa que el modelo técnico debe contemplarlo.

---

### 5. Modelo lógico propuesto

#### A. Tipo
Clasificación del aviso:

- editorial
- archivos
- producción
- propuesta
- comunicación
- sistema

#### B. Prioridad

- info
- attention
- important

#### C. Estado
Ya existe:

- `pending`
- `sent`
- `read`

#### D. Entidad origen
Cada notificación debe poder apuntar lógicamente a una de estas entidades:

- `manuscript`
- `project`
- `chapter`
- `review`
- `proposal`
- `deliverable`
- `message`
- `timeline_event`
- `notification` no aplica como origen
- `admin_event` si hace falta

---

### 6. Relación con el modelo actual del proyecto

#### Autor
Las notificaciones del autor deben colgar de `author_id`.

#### Obra
Cuando una notificación tenga contexto editorial, debería además referenciar la obra/proyecto de forma lógica.

#### Manuscrito
Si la notificación se origina en el ingreso o evaluación inicial, su referencia conceptual más cercana es `manuscript` o `project_request`.

#### Capítulo
Si el aviso es por revisión/cotización/pago de un capítulo, debe apuntar al capítulo correspondiente.

#### Revisión
Si el aviso nace de feedback editorial, su origen lógico es `reviews`.

#### Propuesta
Si el aviso tiene que ver con aceptación o actualización comercial, su origen lógico es `proposals`.

---

### 7. Relación con Admin y Autor

#### Autor puede:

- ver sus notificaciones;
- marcarlas como leídas;
- abrir la entidad asociada;
- recibir avisos de su obra.

#### Admin puede:

- crear notificaciones administrativas;
- ver notificaciones de operación;
- marcar vistas o gestionarlas si el flujo lo requiere.
Pero Admin **no debería usar notificaciones como chat**.

---

### 8. Dedupe / anti-duplicación
Esto es clave.

Cada notificación debe tener una llave conceptual única de evento, por ejemplo:

- mismo evento
- misma entidad
- mismo receptor
Así evitamos que se creen notificaciones duplicadas por:

- recarga;
- reintento;
- doble submit;
- re-render.

---

### 9. Acciones de una notificación
Una notificación puede abrir:

- obra/proyecto;
- manuscrito;
- capítulo;
- revisión;
- propuesta;
- entregable;
- conversación futura;
- historial/timeline;
- página de contacto si aún no existe una vista mejor.

---

### 10. Lo que no debe hacer el modelo técnico
No debe:

- cambiar el estado editorial por sí sola;
- sustituir una conversación;
- sustituir `reviews`;
- sustituir `timeline`;
- sustituir `proposals`;
- mezclarse con `internal_notes`;
- servir como contenedor de texto libre sin contexto.

---

### 11. Reutilización de infraestructura existente
Hoy la parte reutilizable sería:

- tabla `notifications`;
- servicio `notification.service.ts`;
- badge y dropdown del navbar;
- políticas RLS ya existentes;
- campo `status` como leído/no leído.

---

### 12. Posible ampliación futura
Solo si hace falta, podríamos añadir después:

- tipo;
- prioridad;
- entity_type;
- entity_id;
- dedupe_key;
- action_url;
- metadata JSON.
Pero eso se decide **después** de revisar si el sistema actual alcanza o no.

---

### 13. Regla técnica principal
La ecuación correcta es:

**evento real** → **notificación** → **navegación a la entidad**

Nunca al revés.

---

### 14. Resultado del modelo técnico
Con esto, una notificación podría quedar pensada así:

> “Nueva revisión disponible”
> type: editorial
> priority: attention
> status: pending
> source: review
> target: chapter/project
> action: abrir revisión

---

### 15. Decisión de esta subfase
Mi propuesta técnica es:

- **reutilizar `notifications`** como base;
- **no crear tabla nueva todavía**;
- dejar preparado el diseño para ampliar metadata solo si el siguiente paso lo demuestra necesario;
- usar el campo `status` actual para leído/no leído;
- no mezclar notificación con comunicación.

## 4. Reglas de eventos aprobadas

# — Modelo técnico de Notificaciones

### Objetivo técnico
Traducir el diseño aprobado a una estructura estable que permita:

- generar notificaciones sin duplicarlas;
- mostrar notificaciones al autor y a Admin;
- enlazarlas con la entidad correcta;
- reutilizar la tabla existente `notifications` si alcanza;
- evitar mezclar notificación con mensaje, revisión o timeline.

---

### 1. Fuente de verdad
La tabla base seguirá siendo:

`notifications`

Porque ya existe, ya tiene RLS y ya está integrada en el navbar.

---

### 2. Estructura técnica mínima
Cada notificación debería poder representar:

- `id`
- `author_id`
- `title`
- `message`
- `status`
- `created_at`
Y además, a nivel funcional, necesitamos conceptualizar estos datos aunque hoy no todos existan como columnas:

- `type` o categoría funcional
- `priority`
- `entity_type`
- `entity_id`
- `action_url` o destino equivalente
- `source_event`
- `dedupe_key`

---

### 3. Campos que ya existen
En el esquema actual ya tenemos:

- `id`
- `author_id`
- `title`
- `message`
- `status`
- `created_at`
Eso significa que el modelo actual ya soporta una notificación simple.

---

### 4. Lo que falta conceptualmente
Hoy no vimos columnas para distinguir con precisión:

- si es revisión, archivo, propuesta, sistema, comunicación, etc.;
- a qué obra/manuscrito/capítulo/revisión apunta;
- qué prioridad tiene;
- si tiene acción directa;
- qué evento la originó;
- cómo evitar duplicados.
Eso no significa que haya que cambiar la base ya mismo, pero sí significa que el modelo técnico debe contemplarlo.

---

### 5. Modelo lógico propuesto

#### A. Tipo
Clasificación del aviso:

- editorial
- archivos
- producción
- propuesta
- comunicación
- sistema

#### B. Prioridad

- info
- attention
- important

#### C. Estado
Ya existe:

- `pending`
- `sent`
- `read`

#### D. Entidad origen
Cada notificación debe poder apuntar lógicamente a una de estas entidades:

- `manuscript`
- `project`
- `chapter`
- `review`
- `proposal`
- `deliverable`
- `message`
- `timeline_event`
- `notification` no aplica como origen
- `admin_event` si hace falta

---

### 6. Relación con el modelo actual del proyecto

#### Autor
Las notificaciones del autor deben colgar de `author_id`.

#### Obra
Cuando una notificación tenga contexto editorial, debería además referenciar la obra/proyecto de forma lógica.

#### Manuscrito
Si la notificación se origina en el ingreso o evaluación inicial, su referencia conceptual más cercana es `manuscript` o `project_request`.

#### Capítulo
Si el aviso es por revisión/cotización/pago de un capítulo, debe apuntar al capítulo correspondiente.

#### Revisión
Si el aviso nace de feedback editorial, su origen lógico es `reviews`.

#### Propuesta
Si el aviso tiene que ver con aceptación o actualización comercial, su origen lógico es `proposals`.

---

### 7. Relación con Admin y Autor

#### Autor puede:

- ver sus notificaciones;
- marcarlas como leídas;
- abrir la entidad asociada;
- recibir avisos de su obra.

#### Admin puede:

- crear notificaciones administrativas;
- ver notificaciones de operación;
- marcar vistas o gestionarlas si el flujo lo requiere.
Pero Admin **no debería usar notificaciones como chat**.

---

### 8. Dedupe / anti-duplicación
Esto es clave.

Cada notificación debe tener una llave conceptual única de evento, por ejemplo:

- mismo evento
- misma entidad
- mismo receptor
Así evitamos que se creen notificaciones duplicadas por:

- recarga;
- reintento;
- doble submit;
- re-render.

---

### 9. Acciones de una notificación
Una notificación puede abrir:

- obra/proyecto;
- manuscrito;
- capítulo;
- revisión;
- propuesta;
- entregable;
- conversación futura;
- historial/timeline;
- página de contacto si aún no existe una vista mejor.

---

### 10. Lo que no debe hacer el modelo técnico
No debe:

- cambiar el estado editorial por sí sola;
- sustituir una conversación;
- sustituir `reviews`;
- sustituir `timeline`;
- sustituir `proposals`;
- mezclarse con `internal_notes`;
- servir como contenedor de texto libre sin contexto.

---

### 11. Reutilización de infraestructura existente
Hoy la parte reutilizable sería:

- tabla `notifications`;
- servicio `notification.service.ts`;

## 4. Reglas de eventos aprobadas
# — Reglas de eventos
La regla central será:

> **Un evento real del sistema puede producir una notificación. Una notificación nunca será la fuente que provoque el evento.**
Eso nos protege de ciclos, duplicados y estados falsos.

---

## 1. Eventos de producción / estado editorial
Estos son especialmente importantes porque después tendrán que convivir con las seis fases editoriales.

### Cambio de fase
Cuando el **estado maestro de una obra/proyecto cambie realmente**:

```
Estado anterior
      ↓
Estado nuevo
      ↓
evento de transición
      ↓
notificación
```
Ejemplo:

> **Tu obra avanzó a Producción**
> Tu proyecto “Mi novela” ha pasado a la fase de Producción.
> **Ver obra →**
**Destinatario:** autor
**Tipo:** producción
**Prioridad:** informativa/atención según la transición
**Destino:** obra/proyecto

### Regla crítica
No vamos a generar seis notificaciones simplemente porque existen seis fases.

Solo se genera cuando **el estado maestro realmente cambia**.

Esto será fundamental para resolver el problema que detectamos anteriormente entre Admin y Dashboard.

---

# 2. Manuscrito recibido
Cuando un manuscrito haya sido registrado correctamente:

### Admin

> **Nuevo manuscrito recibido**
> Hay una nueva obra pendiente de gestión.
**Destinatario:** Admin
**Tipo:** archivos/producción
**Prioridad:** atención
**Destino:** manuscrito/proyecto

### Autor
No necesariamente necesita recibir una segunda notificación si la interfaz ya confirma correctamente la recepción.

Si queremos confirmación:

> **Manuscrito recibido**
> Hemos recibido correctamente tu manuscrito.
**Prioridad:** informativa.

Pero no debemos generar ambas indiscriminadamente.

---

# 3. Archivo recibido
Cuando Admin recibe/sube un archivo relacionado con una obra:

**Destinatario:** Admin si requiere procesamiento.

Si el archivo pasa a estar disponible para el autor:

> **Nuevo archivo disponible**
> Ya puedes consultar el archivo asociado a tu proyecto.
**Tipo:** archivos
**Prioridad:** atención
**Destino:** biblioteca/archivo.

---

# 4. Entregable nuevo
Cuando aparezca un entregable que realmente esté disponible para el autor:

> **Nuevo entregable disponible**
> Ya puedes consultar el nuevo archivo de tu proyecto.
**Destinatario:** autor
**Tipo:** archivos
**Prioridad:** atención
**Acción:** abrir biblioteca/entregable.

La notificación no contiene el archivo.

---

# 5. Revisión nueva
Este es uno de los eventos más importantes.

Cuando se cree una revisión editorial destinada al autor:

> **Nueva revisión disponible**
> Hay observaciones sobre una entrega de tu proyecto.
**Destinatario:** autor
**Tipo:** editorial
**Prioridad:** atención
**Origen:** `reviews`
**Acción:** abrir revisión.

La notificación **no sustituye la revisión**.

---

# 6. Revisión actualizada
Si una revisión existente cambia de forma relevante:

> **Tu revisión fue actualizada**
Solo se genera si el cambio es realmente significativo.

No debemos notificar:

- cambios internos;
- correcciones administrativas;
- cambios de timestamps;
- actualizaciones técnicas irrelevantes.

---

# 7. Corrección solicitada
Cuando el equipo editorial solicite una acción al autor:

> **Se requiere una corrección**
> Hay una observación pendiente en tu entrega.
**Tipo:** editorial
**Prioridad:** importante
**Acción:** abrir revisión.

Esta sí debe ser una notificación claramente accionable.

---

# 8. Corrección completada / aprobada
Cuando Admin/editorial confirme una corrección:

> **Corrección aprobada**
> La corrección de tu entrega fue aprobada.
**Tipo:** editorial
**Prioridad:** informativa.

---

# 9. Propuestas
Aquí debemos distinguir perfectamente el ciclo.

### Propuesta creada
Cuando exista una propuesta real disponible para el autor:

> **Tu propuesta está disponible**
**Autor → propuesta**

**Prioridad:** importante
**Acción:** abrir propuesta.

### Propuesta actualizada
Si cambia una propuesta que el autor debe revisar:

> **Tu propuesta fue actualizada**
**Prioridad:** importante.

### Propuesta aceptada
**Admin recibe:**

> **Propuesta aceptada**

### Propuesta rechazada
**Admin recibe:**

> **Propuesta rechazada**

### Regla
No vamos a crear una notificación de “propuesta” simplemente porque se creó un registro técnico.

Tiene que existir una transición funcional que haga que la propuesta sea relevante para el destinatario.

---

# 10. Comunicación
Cuando implementemos el sistema de comunicación separado:

```
Nuevo mensaje
      ↓
notification
      ↓
abrir conversación
```
Ejemplo:

> **Nuevo mensaje de StudioFlamkit**
> Tienes una nueva respuesta sobre tu proyecto.
Pero:

**el contenido completo pertenece a Messages, no a Notifications.**

Esta separación queda protegida.

---

# 11. Actividad / Timeline
El timeline puede registrar:

> “Admin actualizó el estado.”
Pero eso **no significa automáticamente**:

> “Crear notificación.”
Son dos cosas diferentes.

Algunos eventos del timeline sí producirán notificación porque son relevantes para el usuario.

Otros solamente quedan registrados internamente.

---

# 12. Internal Notes
Nunca:

```
internal_note
   ↓
notificación al autor
```
Las notas internas permanecen internas.

Incluso si una nota habla de un autor.

---

# 13. Eventos que NO generan notificación
Esto es tan importante como los que sí.

No notificaremos:

- cada render;
- cada refresh;
- cada consulta a Supabase;
- cambios internos de UI;
- cambios de timestamps;
- modificaciones administrativas irrelevantes;
- creación de registros auxiliares;
- cambios internos de metadata;
- acciones duplicadas;
- eventos que todavía no representan una transición real.
Esto mantiene la campana útil.

---

# 14. Anti-duplicación
Cada evento relevante deberá tener una identidad lógica.

Conceptualmente:

```
receptor
+
evento
+
entidad
+
transición
```
Ejemplo:

```
autor-123
+
review-created
+
review-456
```
No debería producir cinco notificaciones porque el frontend hizo cinco llamadas.

---

# 15. Reintentos
Si una operación falla y se reintenta:

```
operación
 ↓
fallo
 ↓
retry
 ↓
éxito
```
La notificación debe producirse **una sola vez**, después del evento confirmado.

No después del intento.

---

# 16. Eventos Admin → Autor
Los eventos que normalmente cruzarán hacia el autor serán:

```
Admin
 ↓
cambio real
 ↓
evento
 ↓
notificación
 ↓
Dashboard
```
Ejemplos:

- nueva fase;
- nueva revisión;
- corrección solicitada;
- propuesta disponible;
- archivo disponible;
- entregable disponible;
- nuevo mensaje.

---

# 17. Eventos Autor → Admin
En sentido contrario:

```
Autor
 ↓
acción real
 ↓
evento
 ↓
notificación Admin
```
Ejemplos:

- nuevo manuscrito;
- archivo enviado;
- propuesta aceptada;
- propuesta rechazada;
- corrección enviada;
- nuevo mensaje.
Esto será especialmente útil para que Admin no tenga que revisar manualmente cada obra para descubrir cambios.

---

# 18. Matriz inicial
| Evento | Autor | Admin | Prioridad |
| :--- | :--- | :--- | :--- |
| Manuscrito recibido | opcional | ✅ | Atención |
| Cambio de fase | ✅ | según caso | Atención |
| Archivo disponible | ✅ | — | Atención |
| Nuevo entregable | ✅ | — | Atención |
| Nueva revisión | ✅ | — | Atención |
| Corrección solicitada | ✅ | — | Importante |
| Corrección aprobada | ✅ | — | Info |
| Propuesta disponible | ✅ | — | Importante |
| Propuesta aceptada | — | ✅ | Importante |
| Propuesta rechazada | — | ✅ | Importante |
| Nuevo mensaje | ✅ | ✅ | Atención |
| Nota interna | ❌ | interno | — |
| Evento técnico | ❌ | ❌ | — |

“—” significa que no se genera por defecto, no que técnicamente sea imposible.

---

# 19. Una decisión importante
No vamos a conectar todavía todos estos eventos directamente a código.

Primero debemos terminar de definir **cuáles de estos eventos existen realmente hoy** y cuáles aparecerán cuando implementemos las funciones de las siguientes subfases.

Por eso 1B2.1.4 define el **contrato funcional**, no obliga a implementar inmediatamente cada evento.

La regla central será:

> **Un evento real del sistema puede producir una notificación. Una notificación nunca será la fuente que provoque el evento.**
Eso nos protege de ciclos, duplicados y estados falsos.

---

## 1. Eventos de producción / estado editorial
Estos son especialmente importantes porque después tendrán que convivir con las seis fases editoriales.

### Cambio de fase
Cuando el **estado maestro de una obra/proyecto cambie realmente**:

```
Estado anterior
      ↓
Estado nuevo
      ↓
evento de transición
      ↓
notificación
```
Ejemplo:

> **Tu obra avanzó a Producción**
> Tu proyecto “Mi novela” ha pasado a la fase de Producción.
> **Ver obra →**
**Destinatario:** autor
**Tipo:** producción
**Prioridad:** informativa/atención según la transición
**Destino:** obra/proyecto

### Regla crítica
No vamos a generar seis notificaciones simplemente porque existen seis fases.

Solo se genera cuando **el estado maestro realmente cambia**.

Esto será fundamental para resolver el problema que detectamos anteriormente entre Admin y Dashboard.

---

# 2. Manuscrito recibido
Cuando un manuscrito haya sido registrado correctamente:

### Admin

> **Nuevo manuscrito recibido**
> Hay una nueva obra pendiente de gestión.
**Destinatario:** Admin
**Tipo:** archivos/producción
**Prioridad:** atención
**Destino:** manuscrito/proyecto

### Autor
No necesariamente necesita recibir una segunda notificación si la interfaz ya confirma correctamente la recepción.

Si queremos confirmación:

> **Manuscrito recibido**
> Hemos recibido correctamente tu manuscrito.
**Prioridad:** informativa.

Pero no debemos generar ambas indiscriminadamente.

---

# 3. Archivo recibido
Cuando Admin recibe/sube un archivo relacionado con una obra:

**Destinatario:** Admin si requiere procesamiento.

Si el archivo pasa a estar disponible para el autor:

> **Nuevo archivo disponible**
> Ya puedes consultar el archivo asociado a tu proyecto.
**Tipo:** archivos
**Prioridad:** atención
**Destino:** biblioteca/archivo.

---

# 4. Entregable nuevo
Cuando aparezca un entregable que realmente esté disponible para el autor:

> **Nuevo entregable disponible**
> Ya puedes consultar el nuevo archivo de tu proyecto.
**Destinatario:** autor
**Tipo:** archivos
**Prioridad:** atención
**Acción:** abrir biblioteca/entregable.

La notificación no contiene el archivo.

---

# 5. Revisión nueva
Este es uno de los eventos más importantes.

Cuando se cree una revisión editorial destinada al autor:

> **Nueva revisión disponible**
> Hay observaciones sobre una entrega de tu proyecto.
**Destinatario:** autor
**Tipo:** editorial
**Prioridad:** atención
**Origen:** `reviews`
**Acción:** abrir revisión.

La notificación **no sustituye la revisión**.

---

# 6. Revisión actualizada
Si una revisión existente cambia de forma relevante:

> **Tu revisión fue actualizada**
Solo se genera si el cambio es realmente significativo.

No debemos notificar:

- cambios internos;
- correcciones administrativas;
- cambios de timestamps;
- actualizaciones técnicas irrelevantes.

---

# 7. Corrección solicitada
Cuando el equipo editorial solicite una acción al autor:

> **Se requiere una corrección**
> Hay una observación pendiente en tu entrega.
**Tipo:** editorial
**Prioridad:** importante
**Acción:** abrir revisión.

Esta sí debe ser una notificación claramente accionable.

---

# 8. Corrección completada / aprobada
Cuando Admin/editorial confirme una corrección:

> **Corrección aprobada**
> La corrección de tu entrega fue aprobada.
**Tipo:** editorial
**Prioridad:** informativa.

---

# 9. Propuestas
Aquí debemos distinguir perfectamente el ciclo.

### Propuesta creada
Cuando exista una propuesta real disponible para el autor:

> **Tu propuesta está disponible**
**Autor → propuesta**

**Prioridad:** importante
**Acción:** abrir propuesta.

### Propuesta actualizada
Si cambia una propuesta que el autor debe revisar:

> **Tu propuesta fue actualizada**
**Prioridad:** importante.

### Propuesta aceptada
**Admin recibe:**

> **Propuesta aceptada**

### Propuesta rechazada
**Admin recibe:**

> **Propuesta rechazada**

### Regla
No vamos a crear una notificación de “propuesta” simplemente porque se creó un registro técnico.

Tiene que existir una transición funcional que haga que la propuesta sea relevante para el destinatario.

---

# 10. Comunicación
Cuando implementemos el sistema de comunicación separado:

```
Nuevo mensaje
      ↓
notification
      ↓
abrir conversación
```
Ejemplo:

> **Nuevo mensaje de StudioFlamkit**
> Tienes una nueva respuesta sobre tu proyecto.
Pero:

**el contenido completo pertenece a Messages, no a Notifications.**

Esta separación queda protegida.

---

# 11. Actividad / Timeline
El timeline puede registrar:

> “Admin actualizó el estado.”
Pero eso **no significa automáticamente**:

> “Crear notificación.”
Son dos cosas diferentes.

Algunos eventos del timeline sí producirán notificación porque son relevantes para el usuario.

Otros solamente quedan registrados internamente.

---

# 12. Internal Notes
Nunca:

```
internal_note
   ↓
notificación al autor
```
Las notas internas permanecen internas.

Incluso si una nota habla de un autor.

---

# 13. Eventos que NO generan notificación
Esto es tan importante como los que sí.

No notificaremos:

- cada render;
- cada refresh;
- cada consulta a Supabase;
- cambios internos de UI;
- cambios de timestamps;
- modificaciones administrativas irrelevantes;
- creación de registros auxiliares;
- cambios internos de metadata;
- acciones duplicadas;
- eventos que todavía no representan una transición real.
Esto mantiene la campana útil.

---

# 14. Anti-duplicación
Cada evento relevante deberá tener una identidad lógica.

Conceptualmente:

```
receptor
+
evento
+
entidad
+
transición
```
Ejemplo:

```
autor-123
+
review-created
+
review-456
```
No debería producir cinco notificaciones porque el frontend hizo cinco llamadas.

---

# 15. Reintentos
Si una operación falla y se reintenta:

```
operación
 ↓
fallo
 ↓
retry
 ↓
éxito
```
La notificación debe producirse **una sola vez**, después del evento confirmado.

No después del intento.

---

# 16. Eventos Admin → Autor
Los eventos que normalmente cruzarán hacia el autor serán:

```
Admin
 ↓
cambio real
 ↓
evento
 ↓
notificación
 ↓
Dashboard
```
Ejemplos:

- nueva fase;
- nueva revisión;
- corrección solicitada;
- propuesta disponible;
- archivo disponible;
- entregable disponible;
- nuevo mensaje.

---

# 17. Eventos Autor → Admin
En sentido contrario:

```
Autor
 ↓
acción real
 ↓
evento
 ↓
notificación Admin
```
Ejemplos:

- nuevo manuscrito;
- archivo enviado;
- propuesta aceptada;
- propuesta rechazada;
- corrección enviada;
- nuevo mensaje.
Esto será especialmente útil para que Admin no tenga que revisar manualmente cada obra para descubrir cambios.

---

# 18. Matriz inicial
| Evento | Autor | Admin | Prioridad |
| :--- | :--- | :--- | :--- |
| Manuscrito recibido | opcional | ✅ | Atención |
| Cambio de fase | ✅ | según caso | Atención |
| Archivo disponible | ✅ | — | Atención |
| Nuevo entregable | ✅ | — | Atención |
| Nueva revisión | ✅ | — | Atención |
| Corrección solicitada | ✅ | — | Importante |
| Corrección aprobada | ✅ | — | Info |
| Propuesta disponible | ✅ | — | Importante |
| Propuesta aceptada | — | ✅ | Importante |
| Propuesta rechazada | — | ✅ | Importante |
| Nuevo mensaje | ✅ | ✅ | Atención |
| Nota interna | ❌ | interno | — |
| Evento técnico | ❌ | ❌ | — |

“—” significa que no se genera por defecto, no que técnicamente sea imposible.

---

# 19. Una decisión importante
No vamos a conectar todavía todos estos eventos directamente a código.

Primero debemos terminar de definir **cuáles de estos eventos existen realmente hoy** y cuáles aparecerán cuando implementemos las funciones de las siguientes subfases.

Por eso 1B2.1.4 define el **contrato funcional**, no obliga a implementar inmediatamente cada evento.

---

# 5. Decisiones
- Reutilizar tabla `notifications`.
- No implementar agrupación automática inicialmente.
- Mantener separación clara con Messages, Reviews, Timeline e Internal Notes.
- No conectar todavía eventos a código (fase de contrato funcional).

## 6. Pendientes
1B2.1.5 — Especificación de implementación.

## 1B2.1.5 — Especificación de implementación
La implementación la dividiría en **5 bloques**, para que sea segura y escalable.

### 1. Núcleo de notificaciones — reutilizar
Mantener:

- `notifications` como tabla base.
- `notification.service.ts` como servicio.
- Navbar/campana existente.
- RLS existente.
No crear otra tabla ni otro servicio paralelo.

### 2. Generación de eventos — adaptar servicios existentes
No pondría un gigantesco `createNotification()` repartido arbitrariamente por toda la aplicación.

La idea será:

```
acción real
   ↓
servicio que ya conoce ese evento
   ↓
evento confirmado
   ↓
notification service
   ↓
notifications
```
Por ejemplo:

```
crear review
   ↓
review.service
   ↓
review creada correctamente
   ↓
notificación al autor
```
Así la notificación no depende de que una pantalla concreta se haya abierto.

### 3. Metadata — no añadir columnas todavía
Aquí hago una pequeña corrección respecto a lo que habíamos dejado como posibilidad:

**No quiero que Gemini altere `notifications` simplemente para implementar 1B2.1.**

Primero implementaremos con lo que ya existe y comprobaremos qué eventos necesitan realmente contexto adicional.

Si posteriormente descubrimos que necesitamos `entity_id`, `type`, `priority` o `dedupe_key`, eso será una decisión explícita de **1B.6 Supabase**, no una modificación incidental.

### 4. UI — evolución conservadora
La campana actual seguirá siendo el punto de entrada.

No vamos a rediseñar Navbar.

La primera implementación deberá conseguir:

```
🔔
 ↓
notificación
 ↓
marcar como leída
 ↓
acción contextual cuando exista
```
Después, en la fase de componentes, podremos extraer:

- `NotificationBell`
- `NotificationPanel`
- `NotificationItem`
si realmente mejora la arquitectura.

### 5. Pruebas
Cada evento implementado tendrá que demostrar:

1. ocurre el evento;
2. se crea **una** notificación;
3. llega al usuario correcto;
4. aparece en la campana;
5. el contador cambia;
6. marcarla como leída funciona;
7. recargar no crea otra;
8. la acción lleva al lugar correcto;
9. otro usuario no puede verla mediante RLS.

---

## Matriz de implementación
| Evento | Fuente prevista | Implementación |
| :--- | :--- | :--- |
| Manuscrito recibido | servicio de manuscrito/request | 🟡 adaptar |
| Cambio de fase | servicio de proyecto/estado | 🔵 depende del estado maestro |
| Nueva revisión | reviews | 🟡 adaptar |
| Corrección solicitada | reviews | 🟡 adaptar |
| Corrección aprobada | reviews | 🟡 adaptar |
| Nuevo entregable | archivos/deliverables | 🟡 adaptar |
| Propuesta disponible | proposals | 🟡 adaptar |
| Propuesta aceptada/rechazada | proposals | 🟡 adaptar |
| Nuevo mensaje | futura comunicación | 🔵 1B2.2 |
| Timeline | timeline | ❌ no genera automáticamente |
| Internal notes | internal_notes | ❌ nunca al autor |

### Algo especialmente importante
**No implementaría ahora “cambio de fase” hasta que terminemos el modelo de estados editoriales.**

Ya detectamos que precisamente ahí existe el problema Dashboard/Admin que nos llevó a esta auditoría.

Por tanto:

> Notificaciones no va a convertirse en otro lugar donde intentemos arreglar los estados.
Primero se define el estado maestro; después ese estado podrá emitir un evento.

---

# Orden de implementación posterior
Cuando lleguemos a código, lo haría en este orden:

**A. Infraestructura existente**
Verificar servicio + RLS + UI.

**B. Primer evento controlado**
Implementar un evento sencillo y verificable.

**C. Editorial**
Reviews/correcciones.

**D. Archivos/entregables.**

**E. Propuestas.**

**F. Estados editoriales**, pero únicamente después del modelo maestro de estados.

**G. Comunicación**, cuando exista 1B2.2.

**H. UI/componentización**, en 1B.3.

Así evitamos construir ocho cosas simultáneamente y luego descubrir que el modelo de estados estaba equivocado.

---

## Estado de 1B2.1
Con esto queda definido:

- **1B2.1.1 Auditoría:** ✅
- **1B2.1.2 Diseño funcional:** ✅ aprobado
- **1B2.1.3 Modelo técnico:** ✅ aprobado
- **1B2.1.4 Reglas de eventos:** ✅ aprobado
- **1B2.1.5 Especificación de implementación:** ✅ definida
**Todavía no hemos implementado código.**

El siguiente paso correcto es actualizar `notifications-design.md` con esta especificación y marcar **1B2.1 como diseño completado**, no como implementación completada.

Después pasamos a:

### **1B2.2 — Comunicación**
Y ahí aplicaremos exactamente el mismo proceso: **auditoría → diseño → modelo técnico → reglas → especificación → aprobación → implementación**.
