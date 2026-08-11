Perfecto. Ya hice la primera pasada real de 1B3.1 — Inventario y clasificación de componentes, directamente sobre main, y crucé lo que existe hoy con las decisiones de 1B2.1–1B2.8.
La conclusión importante es que no debemos empezar creando componentes nuevos a lo loco. El repo ya tiene una base bastante útil; la prioridad es protegerla y convertirla gradualmente en la arquitectura que acabamos de definir.
1B3.1 — Inventario técnico actual
Dashboard: hay una base de componentes bastante madura
src/components/dashboard/ ya contiene:
AuthorCarousel.tsx
FilePanel.tsx
FilesLibraryModal.tsx
KpiCard.tsx
ManuscriptSwitcher.tsx
NextActionCard.tsx
ProgressTimeline.tsx
StatusHero.tsx
SupportPanel.tsx
editorialJourney.ts
Esto confirma algo importante:
1A sí tuvo efecto real. Ya no tenemos el viejo AuthorDashboardShell; las piezas reutilizables principales están físicamente separadas y page.tsx sigue siendo el coordinador. FilesLibraryModal, ManuscriptSwitcher y StatusHero están realmente presentes en main. 
Clasificación inicial
Pieza	Estado	Decisión
StatusHero	útil / central	Reutilizar
ManuscriptSwitcher	ya extraído en 1A	Reutilizar
FilesLibraryModal	ya extraído en 1A	Reutilizar
FilePanel	infraestructura de archivos	Reutilizar / adaptar
KpiCard	genérico	Reutilizar
NextActionCard	muy útil para 1B3	Reutilizar / adaptar
ProgressTimeline	interesante pero parcialmente solapado con EditorialJourney	Revisar antes de tocar
editorialJourney.ts	actualmente candidato a convertirse en dominio	Migrar, no duplicar
SupportPanel	ahora debe respetar 1B2.2	Adaptar después de Communication
AuthorCarousel	específico de experiencia visual	Mantener específico


El punto más delicado es ProgressTimeline + editorialJourney.ts: no debemos crear ahora otro deriveEditorialJourney() dejando el anterior intacto. Ahí hay un riesgo claro de terminar con dos motores de fases. 
2. Estructura general de componentes
La raíz de componentes hoy está organizada alrededor de:
components/
├── cards
├── dashboard
├── feedback
├── forms
├── layout
├── theme
└── ui
No existe una carpeta paralela components/admin. 
Eso me dice algo importante:
Admin actualmente vive demasiado dentro de admin/page.tsx y admin.service.ts.

Por ahora no voy a mandar a Gemini a crear components/admin/ entero.
Primero hay que extraer solo los bloques que realmente tengan una frontera funcional clara.
3. Feedback
Existe:
src/components/feedback/
├── ErrorMessage.tsx
└── Loading.tsx
Es muy poco.
Esto confirma el hallazgo de 1B2.3:
El modelo de Feedback está mucho más desarrollado en la arquitectura/documentación que en componentes reutilizables reales.

Por eso no conviene intentar “arreglar Feedback” antes de crear su servicio de dominio.
4. Servicios actuales
El directorio src/services/ contiene, entre otros:
admin.service.ts
admin.service.patch.ts
auth.service.ts
client.service.ts
file.service.ts
manuscript.service.ts
notification.service.ts
payment.service.ts
project.service.ts
storage.service.ts
Esto confirma el patrón que vimos en 1B2.7:
Ya existen servicios por capacidad:
✅ auth
✅ files
✅ manuscript
✅ notifications
✅ project
Pero faltan como servicios de primera clase:
❌ request
❌ proposal
❌ review
❌ timeline
❌ internal-notes
❌ communication
Y además:
admin.service.ts mide unas 24 KB y admin.service.patch.ts existe aparte.

Eso es una señal fuerte de que Admin está actuando como contenedor de demasiada lógica de dominio, exactamente como detectamos en la auditoría. 
5. project.service.ts es el primer gran objetivo
Inspeccioné su contenido actual.
Tiene:
CRUD de projects;
CRUD de manuscripts;
getAuthorProjectData();
getAuthorProjectsList();
AuthorProjectData;
cálculo de progreso;
mapeo de estados;
joins de capítulos y entregables.
Esto es útil, pero también revela el primer conflicto de 1B3:
project.service.ts
ya contiene dominio + ViewModel de Dashboard + reglas de progreso.
Eso significa que no debemos crear otro ProjectDomainService encima sin refactorizar este.
Primera intervención arquitectónica:
separar el concepto de Project de AuthorProjectData.

6. El progreso es ahora mismo el mayor peligro
Esto merece una bandera roja.
El servicio de proyecto calcula:
pendiente      → 0%
cotizado       → 20%
pagado         → 40%
en_produccion  → 75%
entregado      → 100%
y también:
planning   → 25%
production → 60%
review     → 85%
completed  → 100%
Eso no puede sobrevivir como lógica definitiva porque 1B2.8 ya determinó que el sistema tiene que separar:
ProjectStatus
de:
Progress
y además existe production_stages en Supabase.
Por tanto:
No voy a pedirle a Gemini que “cree domain.types.ts” y deje esta lógica igual.
Primero debe extraer y proteger la lógica de dominio correcta.
7. editorialJourney.ts
Este archivo es especialmente importante:
src/components/dashboard/editorialJourney.ts
Por nombre y ubicación, ya existe una implementación de la idea que en 1B2.7 llamamos:
EditorialJourney
Mi decisión
No crear:
src/domain/editorial/deriveEditorialJourney.ts
a ciegas.
Primero hay que leer y migrar el editorialJourney.ts existente.
Eso puede convertirse en la semilla del motor de dominio.
Esta es exactamente la clase de reutilización que debemos hacer en 1B.3:
extraer lo que ya funciona, no reemplazarlo por una abstracción nueva porque suena más limpia.

8. StatusHero
Está realmente conectado a Dashboard y es una pieza visual importante. 
Decisión
No tocarlo visualmente todavía.
Primero debemos cambiar la fuente de datos que recibe:
old dashboard state
hacia:
AuthorProjectViewModel
Ese es el patrón correcto:
cambiar contrato de datos antes que diseño.

9. FilePanel + FilesLibraryModal
Estos componentes ya representan una separación bastante buena:
FilePanel
    ↓
abre
FilesLibraryModal
y están ligados al flujo de biblioteca de archivos ya consolidado en 1A. 
Decisión
No reemplazar.
Solo aseguraremos que consuman el mismo projectId/contexto de obra que el resto del workspace.
10. ManuscriptSwitcher
Está donde debe estar:
components/dashboard/ManuscriptSwitcher.tsx
y es uno de los resultados directos de 1A. 
Decisión
Reutilizar tal cual, salvo que la migración de ViewModel necesite cambiar su props.
No crear otro selector global.
11. NextActionCard
Tiene mucho potencial para conectar con:
Propuestas;
Feedback;
Archivos;
próximas acciones.
Pero no debemos convertirlo en un “router gigante” que conozca todas las entidades.
Decisión
Reutilizar como componente visual.
La decisión de qué es la siguiente acción deberá venir del dominio/ViewModel.
12. SupportPanel
Hay que tener cuidado aquí.
El panel existe visualmente, pero 1B2.2 determinó que Comunicación/Soporte está incompleto.
Decisión
Mantener el componente visual.
No conectarlo todavía directamente a una pseudo-mensajería.
Primero communication.service.
Esto evita convertir SupportPanel en un segundo sistema de comunicación improvisado.
13. Admin
Aquí está la parte más importante del inventario.
No hay una familia de componentes Admin claramente separada como la de Dashboard.
El admin/page.tsx concentra:
auth;
selección de autor;
selección de proyecto;
solicitudes;
proyectos;
capítulos;
entregables;
feedback;
cotización;
mutaciones;
modales;
formularios;
etc.
Y admin.service.ts también concentra mucho dominio. 
Decisión
No extraer Admin entero todavía.
Primero necesitamos crear las piezas de dominio y migrar una capacidad por vez.
14. Primer orden de extracción de componentes Admin
Cuando toque extraer, mi orden sería:
1. ProjectSelector / ProjectContext
2. ProjectSummary
3. ChapterManager
4. DeliverablesPanel
5. FeedbackPanel
6. ProposalPanel
7. TimelinePanel
8. InternalNotesPanel
Pero no todos en un solo PR/commit.
Y varios de esos no deberían construirse hasta que exista su service.
15. Qué NO debe hacer Gemini todavía
Yo no le daría todavía una tarea abierta como:
“Refactoriza toda la arquitectura y crea componentes reutilizables.”

Eso sería demasiado peligroso.
Tampoco:
“Crea src/domain/ completo.”

Porque ya tenemos código existente que debe reutilizarse.
16. Primer bloque que sí le daría a Gemini
Ahora sí tenemos un candidato seguro:
1B3.1.A — Preparar la capa de tipos de dominio sin cambiar comportamiento
Objetivo:
Supabase types
        ↓
domain types
pero sin migrar consumidores todavía.
Debe:
inspeccionar database.types.ts;
crear solo los tipos compartidos mínimos;
no borrar tipos existentes;
no cambiar queries;
no cambiar UI;
no cambiar Supabase;
ejecutar lint/build;
reportar todos los consumidores futuros que todavía usan tipos antiguos.
Esto nos da una base segura para el siguiente paso.
17. Después de ese bloque
Yo reviso el diff de Gemini.
Si está limpio:
1B3.1.B
Extraemos EditorialJourney existente hacia la capa compartida, reutilizando editorialJourney.ts.
Después:
1B3.2
Proyecto + estados + progreso.
Después:
1B3.3
Solicitudes/Propuestas.
Y así sucesivamente.
El mapa que voy a seguir
1B3.1  Inventario                ← estamos aquí
   ↓
1B3.1.A Tipos seguros
   ↓
1B3.1.B EditorialJourney
   ↓
1B3.2   Proyecto + estados
   ↓
1B3.3   Request + Proposal
   ↓
1B3.4   Reviews + Timeline + Notifications
   ↓
1B3.5   ViewModels + hooks
   ↓
1B3.6   Dashboard
   ↓
1B3.7   Admin
   ↓
1B3.8   Componentes finales + limpieza + QA
Y una regla que voy a mantener durante toda 1B.3
Gemini implementa bloques acotados. Yo reviso cada bloque antes de que pase al siguiente.
No vamos a permitir que Gemini haga una “gran refactorización” y luego descubramos 40 cambios de comportamiento de golpe.
El primer encargo seguro para Gemini ya está definido: 1B3.1.A — tipos de dominio, sin cambio funcional.