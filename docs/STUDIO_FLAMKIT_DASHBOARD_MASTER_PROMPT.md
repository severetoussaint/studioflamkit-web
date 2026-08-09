# Studio Flamkit & Art — Master Prompt Package

This document packages the core product, architecture, design, dashboard, and AI rules for Gemini.

> Use this file as the first context anchor before generating or modifying code.

---

## Package Contents

1. `00-project-vision.md`
2. `01-architecture.md`
3. `02-design-system.md`
4. `03-dashboard-spec.md`
5. `04-gemini-rules.md`
6. `05-roadmap.md`

## How to use with Gemini

- Load or paste this file first.
- Ask Gemini to respect the product vision.
- Ask Gemini to respect the architecture.
- Ask Gemini to follow the design system.
- Ask Gemini to follow the dashboard spec.
- Ask Gemini to obey the AI rules.
- Ask Gemini to implement only the requested phase.

---

# Combined Reference


<!-- BEGIN: 00-project-vision.md -->

# Studio Flamkit & Art

**Documento:** Project Vision  
**Versión:** 1.0.0  
**Estado:** Activo  
**Propietario:** Producto / UX / Frontend  
**Última actualización:** 2026-08-06

---

## 1. Propósito del documento

Este documento define la visión oficial del producto digital de Studio Flamkit & Art y funciona como fuente de verdad para la experiencia del autor, el diseño de interfaz, la arquitectura frontend y las instrucciones que se entreguen a herramientas de IA durante el desarrollo.

Su objetivo no es describir “un dashboard”, sino establecer la lógica de un **Centro del Autor**: un espacio de trabajo editorial donde cada autor pueda entender con claridad qué ocurre con su obra, qué sigue y qué necesita hacer ahora.

---

## 2. Qué es Studio Flamkit & Art

Studio Flamkit & Art es una casa creativa especializada en transformar libros en experiencias de audio profesionales para autores independientes hispanohablantes. La marca no debe percibirse como una empresa tecnológica genérica, sino como un estudio editorial y creativo de alto nivel, con una operación clara, ordenada y humana.

La empresa se posiciona alrededor de una idea simple:

**no vende solamente producción de audio; vende una transformación de la obra y de la experiencia del autor.**

La propuesta de valor combina:
- producción profesional,
- acompañamiento durante el proceso,
- transparencia,
- claridad operativa,
- y una presentación premium de la obra.

---

## 3. Misión

La misión de Studio Flamkit & Art es ayudar a autores independientes a convertir sus libros en experiencias de audio profesionales que amplíen el alcance de sus obras, fortalezcan su marca como autores y conecten con nuevas audiencias mediante una producción de alta calidad.

La misión no se centra en herramientas internas ni en procesos técnicos; se centra en el resultado que recibe el autor.

---

## 4. Visión

La visión de Studio Flamkit & Art es convertirse en una referencia reconocida en el mercado hispanohablante por transformar libros en experiencias sonoras de alta calidad, con una identidad editorial, una operación profesional y una experiencia de autor clara, elegante y confiable.

La visión debe ser ambiciosa, pero realista. No busca dominar un mercado masivo; busca construir una posición sólida y diferenciada dentro de un nicho específico de valor alto.

---

## 5. Público objetivo

El cliente principal es un autor independiente hispanohablante que ya publicó al menos un libro y desea aumentar su alcance y ventas.

Perfil base:
- Edad orientativa: 35–60 años.
- Idioma: español.
- Mercado: países hispanohablantes.
- Capacidad económica: media o media-alta.
- Motivación: crecer, profesionalizar su obra, ganar alcance y mejorar su presencia como autor.

Este cliente suele estar presente en canales como Amazon KDP, grupos de escritores, Instagram, YouTube, LinkedIn, Goodreads y Reddit.

Sus preocupaciones principales suelen ser:
- perder dinero,
- recibir baja calidad,
- que su obra sea maltratada,
- no entender el proceso,
- o no saber si la inversión tendrá retorno.

---

## 6. Posicionamiento

Studio Flamkit & Art no compite por ser la opción más barata.

Compite por:
- calidad,
- claridad,
- confianza,
- organización,
- trato humano,
- identidad editorial,
- y una experiencia profesional de principio a fin.

La comunicación comercial debe hablar de:
- lectores,
- alcance,
- valor,
- impacto,
- profesionalismo,
- y transformación de la obra.

Debe evitar la jerga técnica innecesaria y cualquier lenguaje que haga sentir al autor que está frente a un sistema frío o burocrático.

---

## 7. Promesa principal al autor

El autor no debería preguntarse si alguien recibió su manuscrito, si está en revisión o qué pasará después.

La plataforma debe responderlo por él.

La promesa principal del producto es:

**“Tu obra siempre estará visible, entendible y acompañada.”**

Esto significa que el sistema debe:
- mostrar el estado real del proyecto,
- comunicar el siguiente paso,
- centralizar los archivos y mensajes relevantes,
- y reducir la incertidumbre durante todo el proceso.

---

## 8. Principios de experiencia

### 8.1 Calma antes que urgencia
La interfaz debe reducir la ansiedad del autor. La experiencia no debe empujar, confundir ni saturar.

### 8.2 Claridad antes que densidad
Solo debe mostrarse información útil para entender el estado del proyecto o tomar una acción concreta.

### 8.3 Progreso visible
Cada etapa debe dejar claro qué está hecho, qué está en curso y qué depende del autor o del equipo.

### 8.4 Información real, nunca simulada
No deben inventarse estadísticas, timelines, mensajes o estados decorativos. La base de datos es la única fuente de verdad.

### 8.5 Jerarquía obvia
La pantalla debe guiar la atención en este orden:
1. estado principal,
2. siguiente paso,
3. progreso o fase,
4. métricas compactas,
5. soporte,
6. archivos,
7. información secundaria.

---

## 9. El Centro del Autor

El Centro del Autor es el núcleo operativo del producto. Su propósito es convertir el proceso editorial en una vista viva y comprensible para el autor.

El Centro del Autor debe adaptarse al estado real del proyecto:

### 9.1 Estado sin manuscrito
El usuario ve una bienvenida clara, una explicación breve del proceso y una llamada a la acción para enviar su manuscrito.

### 9.2 Estado manuscrito enviado / en evaluación
La pantalla cambia automáticamente para confirmar que la obra fue recibida, explicar que está en evaluación y orientar sobre lo que ocurrirá después.

### 9.3 Estado activo / en producción
La interfaz se convierte en una vista viva del proyecto. Debe mostrar progreso real, capítulos o unidades de producción, entregables, observaciones, pagos asociados, próximos pasos y soporte directo.

En todos los estados, el usuario debe sentir control, avance y claridad.

---

## 10. Flujo del autor

El recorrido conceptual del autor dentro de Studio Flamkit & Art sigue estas etapas:

1. Descubrimiento.
2. Exploración.
3. Estimación.
4. Solicitud.
5. Evaluación.
6. Propuesta.
7. Confirmación.
8. Producción.
9. Revisión.
10. Entrega final.

La experiencia digital debe respetar ese recorrido y comunicarlo de forma comprensible en cada fase.

---

## 11. Filosofía operativa

La operación de Studio Flamkit & Art se basa en estos principios:

- El autor siempre sabe en qué etapa se encuentra su obra.
- Cada proyecto sigue un proceso estandarizado.
- La comunicación es clara y centralizada.
- Los presupuestos son personalizados y transparentes.
- La tecnología facilita el proceso; no sustituye el acompañamiento humano.
- La experiencia debe parecer la de una agencia o estudio especializado, incluso si la operación inicial es pequeña.

---

## 12. Qué debe comunicar el producto

La plataforma debe comunicar:
- profesionalismo,
- confianza,
- orden,
- calma,
- avance real,
- trato humano,
- exclusividad,
- y una identidad creativa sólida.

La sensación general debe ser más cercana a una editorial premium o un estudio creativo que a un software corporativo tradicional.

---

## 13. Qué NO debe ser el producto

El Centro del Autor no debe parecer:
- un CRM genérico,
- un panel frío de administración,
- una maqueta decorativa sin datos reales,
- un producto sobrecargado de métricas irrelevantes,
- una app técnica difícil de entender,
- o una interfaz que solo “se ve bien” pero no ayuda al autor.

Tampoco debe depender de datos ficticios para llenar espacios visuales.

---

## 14. Diseño de la interfaz

La experiencia visual debe sentirse:
- editorial,
- artesanal,
- elegante,
- cálida,
- mínima,
- y premium.

La interfaz debe transmitir una combinación de estudio creativo y software profesional de alto nivel. El lenguaje visual debe ser limpio, con mucho aire, jerarquía clara y elementos que parezcan cuidadosamente editados.

---

## 15. Principios para el contenido de la interfaz

La interfaz siempre debe responder, de forma implícita o explícita:

- ¿Qué está pasando con mi obra?
- ¿Qué sigue?
- ¿Necesito hacer algo ahora?

Si una tarjeta, bloque o módulo no responde una de esas preguntas, probablemente no debería mostrarse.

---

## 16. Reglas para trabajar con IA

La IA puede ayudar a implementar, pero no puede inventar el producto.

Reglas base:
- no inventar datos,
- no modificar lógica crítica sin instrucción explícita,
- no eliminar servicios existentes,
- no duplicar estados,
- no reemplazar la base de datos como fuente de verdad,
- no generar pantallas de relleno,
- no improvisar flujos que contradigan la documentación.

La documentación del proyecto debe ser la referencia principal antes de pedir cambios a Gemini u otra IA.

---

## 17. Principios de desarrollo

### 17.1 Mantenibilidad
Cada cambio debe dejar el proyecto más claro y más fácil de extender.

### 17.2 Reutilización
Antes de crear un componente nuevo, revisar si ya existe algo reutilizable.

### 17.3 Seguridad arquitectónica
No tocar servicios, estados, consultas o lógica crítica sin una razón justificada.

### 17.4 Validación
Cada fase debe pasar por TypeScript, revisión visual y verificación de que no se rompieron funciones clave.

---

## 18. Visión a largo plazo

A medio y largo plazo, el Centro del Autor debe poder crecer hacia:
- mensajería,
- notificaciones,
- pagos,
- revisiones,
- entregables,
- seguimiento de producción,
- soporte directo,
- y automatizaciones futuras.

El sistema debe dejar espacio para crecer sin perder coherencia ni claridad.

---

## 19. Definición corta del producto

**Studio Flamkit & Art transforma libros en experiencias de audio profesionales y ofrece a cada autor un espacio de trabajo editorial, claro y premium para seguir su proyecto de principio a fin.**

---

## 20. Criterio de éxito

Este documento será útil si, al leerlo:
- un diseñador entiende la identidad del producto,
- un frontend senior entiende la lógica de la experiencia,
- un desarrollador entiende qué no debe romper,
- y una IA puede ayudar sin improvisar reglas nuevas.

<!-- END: 00-project-vision.md -->


<!-- BEGIN: 01-architecture.md -->

# Studio Flamkit & Art

**Documento:** Architecture  
**Versión:** 1.0.0  
**Estado:** Activo  
**Propietario:** Ingeniería Frontend  
**Última actualización:** 2026-08-07

---

## 1. Objetivo

Este documento describe la arquitectura real del proyecto en su último commit. Su propósito es servir como referencia para diseño, rediseño y prompts de IA sin romper la base existente.

---

## 2. Resumen ejecutivo

El proyecto está construido con **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**.  
La aplicación ya separa claramente:

- **capas de UI reutilizable** en `src/components/`,
- **lógica de negocio y acceso a datos** en `src/services/`,
- **clientes y utilidades de Supabase** en `src/lib/supabase/`,
- **providers globales** en `src/providers/`,
- **tipos de datos** en `src/types/`,
- y **rutas funcionales** en `src/app/`.

El archivo más crítico para el Centro del Autor es:

- `src/app/dashboard/page.tsx`

Ese archivo contiene la experiencia principal del autor y concentra:
- autenticación,
- carga de estado del manuscrito,
- carga del proyecto,
- modales de interacción,
- navegación interna,
- y buena parte de la UI del dashboard.

---

## 3. Estructura del proyecto

### Raíz relevante

- `package.json`
- `tailwind.config.ts`
- `tsconfig.json`
- `next.config.ts`
- `middleware.ts`
- `supabase/config.toml`
- `supabase/migrations/`

### `src/`

- `src/app/` → rutas de Next.js
- `src/components/` → componentes UI y de layout
- `src/services/` → acceso a datos y lógica de negocio
- `src/lib/` → clientes y helpers
- `src/providers/` → providers globales
- `src/types/` → tipos TypeScript de dominio
- `src/features/` → módulos por dominio
- `src/config/` → configuración de rutas, tema y env
- `src/utils/` → utilidades varias

---

## 4. Rutas principales

Dentro de `src/app/` existen, entre otras, estas rutas:

- `admin/`
- `calculadora/`
- `contacto/`
- `cotizacion/`
- `dashboard/`
- `faq/`
- `login/`
- `privacidad/`
- `registro/`
- `servicios/`

La ruta más importante para esta fase es:

- `src/app/dashboard/page.tsx`

---

## 5. Tecnologías y dependencias clave

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Animación
- `motion/react` (ya está instalado y se usa en la app)

### Iconografía
- `lucide-react`

### Backend / BaaS
- Supabase
- `@supabase/ssr`
- `@supabase/supabase-js`

### Formato / helpers
- utilidades propias en `src/lib/utils.ts`
- tipos de base de datos en `src/types/database.types.ts`

---

## 6. Sistema de diseño existente

### Variables de color en `src/app/globals.css`

El proyecto ya tiene variables CSS para modo claro y oscuro:

- `--color-bg`
- `--color-bg-elevated`
- `--color-text`
- `--color-text-muted`
- `--color-accent`
- `--color-accent-hover`
- `--color-border`
- `--color-night`

### Tema

- El modo oscuro se activa con la clase `.dark` en `<html>`.
- `src/app/layout.tsx` ya aplica las variables de fuentes.
- `src/providers/ThemeProvider.tsx` existe como proveedor global, pero en este commit está implementado como stub simple.

---

## 7. Layout global

### `src/app/layout.tsx`

El layout raíz:
- importa `globals.css`
- carga `cormorant` e `inter` desde `src/app/fonts.ts`
- envuelve la app con `Providers`
- define metadata del sitio
- usa `suppressHydrationWarning` en `<html>`

Esto indica que el proyecto ya está preparado para un sistema visual consistente con soporte de tema.

---

## 8. Componentes reutilizables existentes

### UI base
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/LoadingScreen.tsx`

### Feedback
- `src/components/feedback/ErrorMessage.tsx`
- `src/components/feedback/Loading.tsx`

### Layout
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Footer.tsx`

### Theme
- `src/components/theme/ThemeToggle.tsx`
- `src/components/theme/ThemeProvider.tsx`

### Estado actual de algunos componentes críticos

- `Navbar.tsx` sí está implementado y contiene lógica real.
- `Sidebar.tsx` es un stub estructural (`return null`).
- `AuthProvider.tsx` es un stub.
- `QueryProvider.tsx` solo renderiza `children`.
- `ThemeProvider.tsx` solo renderiza `children`.

Esto significa que la base visual existe, pero parte de la infraestructura global todavía es mínima o provisional.

---

## 9. Providers globales

### `src/providers/`

- `AuthProvider.tsx`
- `QueryProvider.tsx`
- `ThemeProvider.tsx`

En este commit, estos providers no son complejos. La lógica importante de sesión y datos todavía vive principalmente dentro de servicios y páginas.

---

## 10. Clientes y acceso a Supabase

### Archivos relevantes
- `src/lib/supabase.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`

### Observaciones
- El proyecto usa Supabase como fuente de verdad.
- El cliente de navegador se crea con `createBrowserClient`.
- El cliente de servidor se crea con `createServerClient`.
- Existe middleware de Supabase para el manejo de sesión.
- `src/lib/supabase/client.ts` incluye logs de debug de entorno.
- `src/lib/supabase.ts` valida que existan las variables de entorno antes de crear el cliente.

---

## 11. Servicios de negocio

### `src/services/`

Archivos presentes:

- `admin.service.ts`
- `auth.service.ts`
- `client.service.ts`
- `manuscript.service.ts`
- `payment.service.ts`
- `project.service.ts`
- `storage.service.ts`
- `index.ts`

### Qué hace cada uno

#### `auth.service.ts`
Gestiona autenticación, sesión y rol del usuario.

#### `manuscript.service.ts`
Gestiona manuscritos, estados del autor y contexto del flujo editorial.

#### `project.service.ts`
Carga el proyecto del autor y sus capítulos/deliverables reales.

#### `payment.service.ts`
Gestiona planes de pago, pagos y facturas.

#### `storage.service.ts`
Gestiona archivos, subida a Storage y registro de entregables.

#### `admin.service.ts`
Contiene lógica más amplia para el panel de administración:
- estado de proyectos,
- solicitudes de cotización,
- capítulos,
- entregables,
- cálculo de precios,
- mapeos entre estados admin y estados DB.

#### `client.service.ts`
Gestiona autores/clientes dentro de la base de datos.

---

## 12. Arquitectura del dashboard

### Archivo crítico
- `src/app/dashboard/page.tsx`

### Estado principal del archivo
Es un componente de cliente (`"use client"`), con lógica real y múltiples estados locales.

### Dependencias directas relevantes
- `getUser`
- `getAuthorRequestState`
- `getAuthorRequestContext`
- `submitManuscript`
- `getAuthorProjectData`
- `Navbar`
- `Footer`
- `Card`
- `LoadingScreen`
- `motion/react`
- `lucide-react`

### Estados locales importantes en el dashboard
- `isChecking`
- `authorId`
- `requestState`
- `requestContext`
- `realProject`
- `active`
- `isPlaying`
- `audioProgress`
- `uploaderModalOpen`
- `dragOver`
- `uploadedFile`
- `uploadingState`
- `uploadProgress`
- `uploadSubmitted`
- `selectedChapter`
- `chaptersState`
- `commentsState`
- `newCommentText`
- `newCommentTime`
- `payingChapter`
- `paymentProcessing`
- `viewInvoice`
- `paymentMethod`
- `paypalEmail`
- `bankIban`
- `bankHolder`
- `deliveryFormat`
- `profileNotification`
- `pendingFile`
- `manuscriptTitle`
- `manuscriptWordCount`
- `submitError`

### Funciones críticas existentes
- `checkAuth` dentro de `useEffect`
- `handleFileSelect`
- `handleSubmitManuscript`
- lógica para cargar capítulos reales desde `projectData`
- mapeo de estados de capítulos desde Supabase a etiquetas visuales

### Riesgo arquitectónico
Este archivo concentra demasiada UI + lógica + estado.  
Es la principal pieza a rediseñar, pero **sin romper sus llamadas reales a servicios**.

---

## 13. Flujo real del dashboard

### Autenticación
1. `getUser()` valida la sesión.
2. Si no hay usuario, se redirige a `/login`.
3. Si hay usuario, se obtiene `authorId`.

### Estado del manuscrito
1. `getAuthorRequestContext(authorId)` determina el estado del manuscrito.
2. Ese estado se guarda en `requestState`.
3. Se usa para decidir si el dashboard muestra:
   - bienvenida,
   - evaluación,
   - o proyecto activo.

### Proyecto real
1. `getAuthorProjectData(authorId)` carga el proyecto.
2. Si existen capítulos, se mapean a `chaptersState`.
3. El dashboard muestra ese contenido como base de la experiencia activa.

### Subida de manuscrito
1. `handleFileSelect` registra el archivo.
2. `handleSubmitManuscript` llama a `submitManuscript`.
3. Luego refresca el estado del autor.

---

## 14. Modelo de datos visible en la arquitectura

### Proyecto autor
`AuthorProjectData` incluye:
- `id`
- `title`
- `status`
- `maxRevisions`
- `revisionsUsed`
- `progress`
- `chapters`
- `deliverables`

### Capítulos
`AuthorChapterData` incluye:
- `id`
- `chapter_number`
- `title`
- `word_count`
- `duration_minutes`
- `price`
- `currency`
- `tier`
- `status`

### Estados de capítulo actuales
- `pendiente`
- `cotizado`
- `pagado`
- `en_produccion`
- `entregado`

---

## 15. Base de datos y migraciones

### Carpeta
- `supabase/migrations/`

### Migración visible
- `20260801120000_create_chapters.sql`

Esto confirma que ya existe una evolución real del esquema orientada a capítulos.

---

## 16. Observaciones importantes para rediseño

### Lo que sí puede cambiar
- JSX del dashboard
- orden visual de bloques
- composición de tarjetas
- densidad de información
- sidebar visual
- jerarquía del contenido
- uso de iconos
- microinteracciones
- layouts por estado

### Lo que no debería cambiar sin una razón fuerte
- llamadas a Supabase
- servicios
- nombres de estados funcionales
- lógica de autenticación
- estructura de datos del proyecto
- flujo de subida de manuscrito
- mapeo real de capítulos y proyectos

### Señal positiva
El proyecto ya tiene una base real para trabajar el Centro del Autor con datos vivos. No es necesario inventar una arquitectura nueva; hace falta organizar y simplificar la existente.

---

## 17. Riesgos detectados

1. `page.tsx` es demasiado grande.
2. Hay providers y componentes stub que pueden inducir a pensar que la base está más completa de lo que realmente está.
3. Hay mezcla fuerte de lógica y UI en el dashboard.
4. El panel admin ya tiene bastante lógica de negocio; hay que evitar duplicarla en el área del autor.
5. Cualquier rediseño debe respetar la fuente de verdad en Supabase.

---

## 18. Recomendación para las siguientes fases

Antes de pedir cambios visuales grandes, conviene seguir este orden:

1. Consolidar documentación.
2. Definir sistema visual.
3. Rediseñar layout del dashboard sin tocar lógica.
4. Separar estados del Centro del Autor por fases:
   - `none`
   - `pending`
   - `active`
5. Crear componentes reutilizables para:
   - hero de estado,
   - timeline,
   - panel de archivos,
   - KPIs compactos,
   - soporte,
   - notificaciones.

---

## 19. Conclusión

La arquitectura actual ya permite construir el nuevo Centro del Autor sin rehacer la plataforma desde cero.  
La base técnica es suficiente, pero el dashboard necesita orden, separación visual y una experiencia mucho más editorial.

La regla principal para cualquier cambio futuro es esta:

> **La base de datos y los servicios existentes son la fuente de verdad.  
> La UI se puede rediseñar; la lógica crítica no se improvisa.**

<!-- END: 01-architecture.md -->


<!-- BEGIN: 02-design-system.md -->

# Studio Flamkit & Art

**Documento:** Design System  
**Versión:** 1.0.0  
**Estado:** Activo  
**Propietario:** Diseño / Frontend  
**Última actualización:** 2026-08-07

---

## 1. Propósito

Este documento define el sistema visual oficial de Studio Flamkit & Art para que el producto mantenga una identidad coherente, premium y editorial en todas sus pantallas.

Su objetivo es evitar improvisación visual. Cualquier nueva interfaz, componente o rediseño debe tomar estas reglas como base.

---

## 2. Principios del sistema visual

### 2.1 Luxury Minimalism
La interfaz debe sentirse silenciosa, elegante y espaciosa. Nada debe competir por atención sin necesidad.

### 2.2 Editorial First
El producto no debe parecer un software corporativo. Debe sentirse más cercano a una editorial contemporánea o a un estudio creativo.

### 2.3 Calma y claridad
La prioridad es que el autor entienda su situación de forma inmediata, sin ansiedad ni ruido visual.

### 2.4 Datos reales
No se usan elementos decorativos que simulen actividad. La interfaz debe reflejar estado real del proyecto y de la base de datos.

### 2.5 Jerarquía visible
Siempre debe quedar claro qué es título, qué es contexto, qué es estado, qué es acción y qué es detalle secundario.

---

## 3. Paleta de color

### 3.1 Base visual

- Fondo principal: `#F6F1E8`
- Fondo de tarjetas: `#FCFAF6`
- Bordes suaves: `#E9DED0`
- Texto principal: `#2C241E`
- Texto secundario: `#7A726B`
- Hover suave: `#FFF2E7`

### 3.2 Marca

- Naranja principal: `#F26B2E`
- Dorado cálido: `#B98C52`

### 3.3 Uso recomendado

#### Naranja `#F26B2E`
Usar para:
- botón principal,
- icono activo,
- progreso,
- estados de atención,
- enlaces importantes,
- elementos de acción inmediata.

#### Dorado `#B98C52`
Usar para:
- detalles de estado,
- chips secundarios,
- porcentajes,
- iconografía suave,
- acentos editoriales,
- información de progreso o validación.

#### Neutros cálidos
Usar para:
- tarjetas,
- fondos,
- separadores,
- tipografía base,
- estados pasivos.

### 3.4 Prohibiciones
- No usar bordes oscuros.
- No usar neones.
- No usar colores fríos dominantes.
- No usar rojo salvo error real.
- No usar azules saturados como lenguaje principal del sistema.

---

## 4. Tipografía

### 4.1 Familia tipográfica

- Títulos: `Cormorant Garamond`
- Texto: `Inter`

### 4.2 Jerarquía recomendada

- H1: `text-4xl` o `text-5xl`, `font-serif`
- H2: `text-2xl` o `text-3xl`, `font-serif`
- Título de tarjeta: `text-lg font-semibold`
- Texto base: `text-sm` o `text-base`
- Caption: `text-xs`

### 4.3 Reglas de uso

- Los títulos deben sentirse editoriales, no tecnológicos.
- Los textos largos deben seguir siendo muy legibles.
- Los números importantes pueden ser grandes, pero nunca agresivos.
- La combinación debe dar prestigio sin sacrificar claridad.

---

## 5. Espaciado y respiración

### 5.1 Principio general
La pantalla debe respirar. Aproximadamente un 35% del espacio visual debe sentirse vacío o de baja densidad.

### 5.2 Padding recomendado

- Tarjetas principales: `p-8` o `p-10`
- Tarjetas secundarias: `p-6`
- Bloques densos: `p-6`
- Secciones completas: `py-12` o `py-16`

### 5.3 Separación entre bloques

- Gap general: `gap-6`
- En layouts amplios: `gap-8`
- Entre elementos pequeños: `gap-3` o `gap-4`

### 5.4 Reglas
- Nunca comprimir la información por intentar “llenar” la pantalla.
- Mejor menos contenido, pero más claro.
- La densidad solo debe aumentar cuando el usuario esté en una vista muy operativa.

---

## 6. Grid y composición

### 6.1 Sistema
La interfaz debe construir su layout sobre una cuadrícula de 12 columnas.

### 6.2 Uso general
- Contenido principal amplio: 8 columnas
- Panel secundario: 4 columnas
- Bloques de igual importancia: 6 / 6
- Tarjetas pequeñas: 3 / 4 columnas según contexto

### 6.3 Reglas
- El layout debe ser estable.
- La jerarquía visual debe ser obvia desde el primer vistazo.
- La composición debe soportar un hero dominante y luego bloques secundarios más pequeños.

---

## 7. Bordes, radios y elevación

### 7.1 Radios oficiales

- Tarjetas: `rounded-2xl` o `rounded-3xl`
- Botones: `rounded-xl`
- Chips: `rounded-full`
- Inputs: `rounded-xl`

### 7.2 Sombras
Usar sombras suaves y cálidas, por ejemplo:

- `shadow-[0_8px_30px_rgba(0,0,0,0.04)]`

### 7.3 Reglas
- Nunca usar sombras pesadas.
- Nunca usar contornos duros.
- La elevación debe sentirse ligera, no flotante de forma artificial.

---

## 8. Componentes base

### 8.1 Tarjeta
La tarjeta es la unidad principal del sistema.

Debe tener:
- fondo claro,
- borde suave,
- radio generoso,
- padding amplio,
- sombra muy sutil.

### 8.2 Botón
Existen tres niveles:

#### Primario
Usar para la acción principal de la pantalla.

- fondo naranja,
- texto blanco,
- altura consistente,
- borde suave,
- hover sutil.

#### Secundario
Usar para acciones complementarias.

- fondo claro,
- borde suave,
- texto oscuro.

#### Ghost
Usar para acciones de bajo peso.

- texto naranja,
- sin relleno dominante.

### 8.3 Chips / badges
Sirven para estados, etiquetas y fases.

Deben ser:
- pequeños,
- redondeados,
- legibles,
- con color contextual.

### 8.4 Inputs
Deben ser limpios, de altura uniforme, con foco sutil y sin bordes agresivos.

### 8.5 Timeline / stepper
Debe ser simple, claro y muy legible. El usuario debe entender el avance sin leer demasiado.

### 8.6 KPI card
Tarjeta compacta para una sola métrica importante.

Debe incluir:
- icono circular,
- valor principal,
- etiqueta corta,
- texto secundario opcional.

### 8.7 Panel de archivos
Debe mostrar:
- nombre,
- peso,
- fecha,
- estado,
- acción.

### 8.8 Bloque de soporte
Debe verse confiable, no comercial.

### 8.9 Hero de estado
Debe dominar la vista inicial cuando el proyecto cambie de estado.

---

## 9. Iconografía

### 9.1 Librería
Preferentemente `lucide-react`.

### 9.2 Estilo
- outline,
- limpio,
- fino,
- claro,
- sin exceso de peso visual.

### 9.3 Tamaños

- Iconos de interfaz: `h-5 w-5`
- Iconos de tarjeta: `h-6 w-6`
- Iconos dentro de círculos: `h-5 w-5`

### 9.4 Tratamiento visual
Los iconos importantes deben ir dentro de un círculo claro, con fondo tenue y color de marca.

---

## 10. Estados visuales

### 10.1 Estado activo
Usar naranja de marca.

### 10.2 Estado completado
Usar dorado cálido o verde suave si el contexto lo exige.

### 10.3 Estado pendiente
Usar neutros suaves.

### 10.4 Estado bloqueado
Usar gris cálido y texto secundario.

### 10.5 Estado de revisión o alerta
Usar naranja intenso solo cuando haya acción requerida.

### 10.6 Regla
El color nunca debe ser decorativo. Siempre debe significar algo.

---

## 11. Animación y motion

### 11.1 Filosofía
Las animaciones deben sentirse discretas, útiles y silenciosas.

### 11.2 Duración recomendada
- 200ms
- ease-out

### 11.3 Microinteracciones
- hover con pequeño desplazamiento,
- leve aumento de sombra,
- transición suave de opacidad,
- cambios de estado con animación ligera.

### 11.4 Prohibiciones
- No hacer animaciones largas.
- No hacer rebotes exagerados.
- No hacer efectos llamativos tipo “app de marketing”.

---

## 12. Responsive behavior

### 12.1 Desktop
Debe mostrar la composición completa con sidebar, hero dominante y paneles laterales.

### 12.2 Tablet
Debe reorganizarse sin perder jerarquía.

### 12.3 Mobile
Debe priorizar:
1. hero,
2. siguiente acción,
3. estado,
4. timeline,
5. archivos,
6. soporte.

### 12.4 Regla
En mobile se simplifica, pero no se convierte en otra experiencia distinta.

---

## 13. Patrones de diseño para el Centro del Autor

### 13.1 Hero principal
Debe ser la primera tarjeta dominante y cambiar según el estado real del proyecto.

### 13.2 Timeline
Debe mostrar etapa actual, completadas y siguientes.

### 13.3 CTA dominante
Debe decir exactamente qué debe hacer el autor ahora.

### 13.4 KPIs compactos
Deben resumir lo esencial sin saturar.

### 13.5 Soporte
Siempre visible, siempre accesible, nunca invasivo.

### 13.6 Archivos
Debe mostrar lo subido, lo bloqueado o lo disponible.

### 13.7 Alertas e hitos
Solo cuando exista una acción o decisión real.

---

## 14. Tokens de estilo recomendados

### 14.1 Sombra base
`shadow-[0_8px_30px_rgba(0,0,0,0.04)]`

### 14.2 Hover de tarjeta
`hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]`

### 14.3 CTA primario
`bg-[#F26B2E] text-white rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 ease-out`

### 14.4 CTA secundario
`bg-surface-elevated border border-edge text-ink rounded-xl px-5 py-3 text-sm transition-all duration-200 ease-out`

### 14.5 Ghost
`text-[#F26B2E] text-sm font-medium hover:underline`

### 14.6 Progress bar
`h-2 rounded-full bg-edge overflow-hidden`

### 14.7 Progress fill
`h-full rounded-full bg-[#F26B2E]`

---

## 15. Sistema de consistencia

### 15.1 Todo debe alinearse
- iconos,
- textos,
- tarjetas,
- botones,
- chips,
- inputs.

### 15.2 Todo debe repetirse con intención
No crear variaciones innecesarias.

### 15.3 Un solo lenguaje visual
La interfaz debe parecer diseñada por un único equipo, no por distintas herramientas.

---

## 16. Reglas para IA

Cuando se use Gemini o cualquier otra IA para generar UI:

- respetar estos tokens,
- no inventar nuevos colores,
- no introducir sombras agresivas,
- no cambiar la filosofía editorial,
- no improvisar botones ni chips,
- no sustituir el sistema visual por uno genérico.

La documentación debe gobernar el resultado.

---

## 17. Qué evaluar en cada pantalla

Antes de aprobar una pantalla, verificar:

- ¿se entiende el estado principal?
- ¿el CTA es obvio?
- ¿la jerarquía visual es clara?
- ¿la pantalla respira?
- ¿hay datos reales?
- ¿el estilo sigue siendo editorial y premium?
- ¿hay algo decorativo sin función?

Si la respuesta a la última pregunta es sí, hay que eliminarlo o justificarlo.

---

## 18. Conclusión

Este design system define una interfaz cálida, elegante y funcional. No busca impresionar con exceso de efectos; busca transmitir autoridad, claridad y lujo silencioso.

Debe servir como base para:
- el Centro del Autor,
- futuras páginas de mensajería,
- pagos,
- notificaciones,
- entregables,
- y cualquier módulo nuevo que se construya dentro de Studio Flamkit & Art.

<!-- END: 02-design-system.md -->


<!-- BEGIN: 03-dashboard-spec.md -->

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

<!-- END: 03-dashboard-spec.md -->


<!-- BEGIN: 04-gemini-rules.md -->

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

<!-- END: 04-gemini-rules.md -->


<!-- BEGIN: 05-roadmap.md -->

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

<!-- END: 05-roadmap.md -->
