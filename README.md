# Studio Flamekit — Project skeleton

Esta rama contiene la estructura inicial del proyecto siguiendo docs/docs/PROJECT_ARCHITECTURE.md.

Objetivo
- Mantener la arquitectura aprobada (Next.js App Router, TypeScript, Tailwind, Supabase) sin implementar lógica de negocio.

Instalación rápida (desarrollo)
1. Clona el repositorio:

   git clone git@github.com:severetoussaint/studioflamkit-web.git
   cd studioflamkit-web

2. Instala dependencias:

   npm install

3. Variables de entorno
   - Crea un fichero `.env.local` basado en `.env.example` y rellena las variables.

4. Ejecuta en modo desarrollo:

   npm run dev

Variables de entorno necesarias
- Publicas (disponibles en el cliente):
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

- Server-only (no exponer en cliente):
  - SUPABASE_SERVICE_ROLE (llave de servicio, solo en entorno servidor)
  - OTHER_SERVER_SECRET (ejemplos para futuras integraciones)

Configuración de Supabase
- Crea un proyecto en Supabase y añade las variables en Netlify (o en tu entorno local .env.local).
- NO publiques la variable SUPABASE_SERVICE_ROLE en el cliente. Usar únicamente en server actions o route handlers.

Despliegue en Netlify
- Se incluye `netlify.toml` con la configuración básica y la recomendación de usar `@netlify/plugin-nextjs`.
- En Netlify UI añade las variables de entorno mencionadas arriba.

Notas de seguridad y buenas prácticas
- Mantén las claves sensibles en el entorno de alojamiento (Netlify) y no en el repositorio.
- Antes de ejecutar builds en CI, asegúrate de que las variables necesarias existan en el entorno.

Siguientes pasos recomendados
- Añadir ESLint/Prettier en CI y habilitar pre-commit hooks (husky + lint-staged).
- Implementar la plantilla de feature en `src/features/` para mantener consistencia.
