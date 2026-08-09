Framework: Next.js 15
Lenguaje: TypeScript
UI: React 19
Estilos: Tailwind CSS
Base de datos: Supabase PostgreSQL
Autenticación: Supabase Auth
Hosting: Netlify
Repositorio: GitHub
Pagos: PayPal

studioflamkit/

├── public/

├── src/

│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── providers.tsx
│
│   ├── components/
│   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │
│   │   ├── feedback/
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorMessage.tsx
│   │
│   │   ├── forms/
│   │   └── cards/
│
│   ├── features/
│   │
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── audiobooks/
│   │   ├── quotations/
│   │   ├── payments/
│   │   ├── invoices/
│   │   ├── author-center/
│   │   ├── manuscript-analysis/
│   │   └── admin/
│
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── ThemeProvider.tsx
│
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── project.service.ts
│   │   ├── payment.service.ts
│   │   └── storage.service.ts
│
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│
│   ├── config/
│   │   ├── env.ts
│   │   ├── routes.ts
│   │   └── theme.ts
│
│   ├── constants/
│
│   ├── types/
│   │   ├── user.ts
│   │   ├── client.ts
│   │   ├── project.ts
│   │   ├── audiobook.ts
│   │   └── payment.ts
│
│   ├── hooks/
│
│   ├── utils/
│   │   ├── validators/
│   │   ├── formatters/
│   │   └── parsers/
│
│   └── styles/

├── .env.example

├── package.json

├── next.config.ts

├── tailwind.config.ts

├── tsconfig.json

└── README.md

Estas reglas son obligatorias:

1. No crear funcionalidades todavía.
2. Solo preparar la arquitectura inicial.
3. No mezclar lógica de negocio con componentes visuales.
4. Cada módulo dentro de features debe ser independiente.
5. Usar TypeScript estrictamente.
6. Mantener separación entre:
   - componentes
   - servicios
   - tipos
   - hooks
   - lógica de negocio
7. Preparar el proyecto para Supabase.
8. Preparar el proyecto para despliegue en Netlify.
9. No instalar librerías innecesarias.
10. No modificar la arquitectura sin autorización.
