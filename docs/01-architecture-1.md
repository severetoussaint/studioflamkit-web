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
