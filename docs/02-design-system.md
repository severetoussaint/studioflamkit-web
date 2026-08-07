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
