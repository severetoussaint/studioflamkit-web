# Resumen de Cambios: Limpieza y Optimización del Dashboard

Este documento resume los cambios realizados en el proyecto `studioflamkit-web` para mejorar la coherencia de datos y limpiar el código de desarrollo.

## Resumen General
Se ha llevado a cabo una limpieza profunda de datos estáticos (mocks) en el dashboard del autor y una optimización en la consulta de proyectos en el panel de administración para asegurar la visibilidad de los datos reales.

## Cambios Realizados

### 1. Limpieza de Datos Mock (Dashboard)
*   Se eliminaron las constantes y arrays ficticios que simulaban datos del usuario (`initialChapters`, `initialComments`, `deliverables`, `invoicesList`).
*   Se limpió la interfaz del dashboard, eliminando valores estáticos (como el ID `#FLAM-2026-89` y los precios inventados) para preparar el componente para la carga dinámica desde Supabase.
*   Se ajustaron las secciones de navegación (`sections`) para no mostrar contadores falsos, dejando la lógica preparada para los datos reales.

### 2. Corrección del Panel de Administración
*   **Problema detectado:** El panel de administración ocultaba los proyectos nuevos debido a una consulta `INNER JOIN` restrictiva en `listAdminProjects`.
*   **Solución:** Se modificó la consulta en `src/services/admin.service.ts` para utilizar `left.chapters` y `left.deliverables`. Esto permite que los proyectos aparezcan en la lista inmediatamente después de su creación, aunque aún no tengan capítulos o entregables asociados.

### 3. Mejora en la Lógica de Estado
*   Se sentaron las bases para una correcta transición entre los estados `none`, `pending` y `active` mediante la normalización de la obtención de contexto (`getAuthorRequestContext`).
*   Se eliminó la dependencia de datos hardcodeados que causaban incoherencias visuales entre el dashboard del autor y el panel de administración.

## Estado Actual
*   El dashboard del autor está limpio y listo para consumir datos reales.
*   El panel de administración muestra correctamente todos los proyectos.
*   El sistema de desarrollo ha sido optimizado y los procesos residuales han sido terminados.
