# Feature folder template

Cada feature debe seguir esta plantilla para mantener consistencia y escalabilidad.

Estructura recomendada (ejemplo):

feature-name/
├── components/         # Componentes específicos del feature
├── hooks/              # Hooks reutilizables del feature
├── services/           # Adaptadores o lógica de acceso a datos (no lógica de negocio)
├── types.ts            # Tipos/Interfaces locales del feature
├── index.ts            # Punto de entrada que exporta la API pública del feature
└── README.md           # Documentación específica del feature

Reglas importantes:
- No mezclar lógica de negocio con componentes visuales.
- Las dependencias entre features deben ser mínimas y a través de contratos (shared services/types).
- Cada feature debe ser independiente y exportar una API pública clara desde su `index.ts`.
