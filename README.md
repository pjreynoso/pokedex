# ⚡ PokeApp — Arquitectura de Microfrontends con React y Vite

Aplicación web modular de alto rendimiento construida bajo el paradigma de **Microfrontends** utilizando **Module Federation**, **React 18**, **TypeScript** y **Tailwind CSS**. La solución integra la PokeAPI para la exploración de categorías, búsqueda con scroll infinito, visualización reactiva de detalles y sincronización en tiempo real de visitas.

---

## 🏛️ Aplicaciones y Puertos

La arquitectura está compuesta por 3 aplicaciones desacopladas y 1 paquete compartido:

| Aplicación / Paquete | Rol Arquitectónico | Puerto / URL | Tecnologías Clave |
| :--- | :--- | :--- | :--- |
| **`apps/shell`** | Host Principal | [http://localhost:3000](http://localhost:3000) | React 18, React Router v7, Zustand, TanStack Query |
| **`apps/mf-detail`** | Remote 1 (Detalle de Pokémon) | [http://localhost:3001](http://localhost:3001) | React 18, Module Federation (`./PokemonDetail`) |
| **`apps/mf-history`** | Remote 2 (Historial de Visitas) | [http://localhost:3002](http://localhost:3002) | React 18, Module Federation (`./PokemonHistory`) |
| **`packages/shared`** | Contratos & Tipos Comunes | Monorepo Workspace | TypeScript, Eventos (`CustomEvent`), Interfaces |

---

## 🚀 1. Pasos de Instalación

### Requisitos Previos del Sistema
- **Node.js:** Versión `≥ 18.x` (LTS recomendada, compatible con Node 20 y 22)
- **npm:** Versión `≥ 9.x`

### Procedimiento de Instalación
1. Clonar el repositorio y acceder a la carpeta del proyecto:
   ```bash
   git clone <url-del-repositorio>
   cd pokedex
   ```

2. Instalar todas las dependencias del monorepo mediante `npm workspaces`:
   ```bash
   npm install
   ```
   *Este comando resuelve de forma centralizada y determinista las dependencias de todo el monorepo (`apps/shell`, `apps/mf-detail`, `apps/mf-history` y `packages/shared`).*

---

## 🛠️ 2. Scripts Disponibles

Todos los comandos principales se ejecutan desde el directorio raíz del proyecto:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | **Inicia concurrentemente** el Shell (3000), MF1 Detalle (3001) y MF2 Historial (3002) con prefijos y colores distintivos en consola. |
| `npm run build` | **Compila para producción** todos los workspaces (`apps/*` y `packages/*`), generando bundles optimizados y los manifiestos `remoteEntry.js`. |
| `npm test` | **Ejecuta la suite completa de pruebas** automatizadas con Vitest y emulación de entorno DOM (`jsdom`). |
| `npm run lint` | **Ejecuta ESLint v9+** en todo el monorepo aplicando reglas estrictas de TypeScript sin advertencias. |
| `npm run typecheck` | **Verifica los tipos de TypeScript** (`tsc --noEmit`) en todos los paquetes y aplicaciones. |

### Comandos Específicos por Workspace
Para ejecutar o compilar de forma individual alguna de las aplicaciones:
```bash
# Iniciar únicamente el Shell Host
npm run dev -w @pokemon/shell

# Iniciar únicamente el Remote de Detalle (MF1)
npm run dev -w @pokemon/mf-detail

# Iniciar únicamente el Remote de Historial (MF2)
npm run dev -w @pokemon/mf-history

# Compilar un workspace específico
npm run build -w @pokemon/shell
```

---

## 🌐 3. Cómo Levantar Shell y Microfrontends

### Opción A: Modo Concurrente Unificado (Recomendado)
Para iniciar la solución completa en una sola terminal:
```bash
npm run dev
```

El script utiliza `concurrently` para orquestar y levantar en paralelo los tres servidores locales:
- 🌐 **Shell (Host):** [http://localhost:3000](http://localhost:3000)
- ⚡ **MF1 Detalle (Remote):** [http://localhost:3001](http://localhost:3001) *(expone `./PokemonDetail` en `/assets/remoteEntry.js`)*
- 🕒 **MF2 Historial (Remote):** [http://localhost:3002](http://localhost:3002) *(expone `./PokemonHistory` en `/assets/remoteEntry.js`)*

### Opción B: Ejecución en Terminales Separadas
Si se prefiere inspeccionar los logs de cada servicio de manera individual:
```bash
# Terminal 1 — Remote MF1 (Puerto 3001)
npm run dev -w @pokemon/mf-detail

# Terminal 2 — Remote MF2 (Puerto 3002)
npm run dev -w @pokemon/mf-history

# Terminal 3 — Shell Host (Puerto 3000)
npm run dev -w @pokemon/shell
```

### Credenciales Demo para el Inicio de Sesión
La pantalla de Login cuenta con credenciales de prueba preconfiguradas:
- **Usuario:** `ash` | **Contraseña:** `pikachu123`
- **Usuario:** `misty` | **Contraseña:** `starmie456`
- *(Cualquier usuario y contraseña con al menos 4 caracteres es aceptado por el validador).*

---

## 🏛️ 4. Decisiones Técnicas (ADR)

### 1. Monorepo Nativo con `npm workspaces` y `@pokemon/shared`
- **Justificación:** Se empleó la capacidad nativa de `npm workspaces` sin añadir herramientas de build monorepo de terceros (como Turborepo o Nx), manteniendo el proyecto liviano, portable y sin sobrecarga de configuración.
- **Contratos Centralizados:** El paquete `@pokemon/shared` define y exporta las interfaces de PokeAPI (`Pokemon`, `PokemonTypeResponse`), tipos de sesión (`User`, `AuthState`), modelos de historial (`VisitedPokemon`), y las constantes críticas del Event Bus (`POKEMON_VISIT_EVENT`) y almacenamiento (`STORAGE_KEYS`), garantizando consistencia de tipos estricta y cero duplicidad.

### 2. Module Federation con Vite (`@module-federation/vite`)
- **Justificación:** Se utiliza la solución oficial de Module Federation 2.0 (`@module-federation/vite`), ofreciendo compatibilidad completa en desarrollo (Vite dev server nativo) y producción, generación automática de manifiestos (`mf-manifest.json`), tipado federado (`@mf-types`) y compartición singleton de dependencias críticas como `react` y `react-dom`.
- **Tolerancia a Fallos (Fault Tolerance):** El Shell envuelve los componentes remotos en un componente de protección `RemoteWrapper` que combina `React.Suspense` con un `RemoteErrorBoundary`. Si alguno de los microfrontends remotos no responde o falla la red, el Shell permanece completamente operativo y despliega un fallback visual amigable con botón de reintento.
- **CORS y Configuración Nativa:** Los remotos configuran CORS abierto (`Access-Control-Allow-Origin: *`) y sirven las entradas federadas (`remoteEntry.js` / `mf-manifest.json`) tanto en el servidor de desarrollo como en preview/producción.

### 3. Gestión de Estado Atómica con Zustand
- **Justificación:** Zustand proporciona stores atómicos, reactivos y con mínimo overhead conceptual:
  - `useAuthStore`: Maneja autenticación, persistencia de sesión en `localStorage` y validación de formulario.
  - `useThemeStore`: Gestiona el selector de tema (Claro / Oscuro) sincronizado con la clase `.dark` en el elemento raíz `<html>`.
  - `useUIStore`: Controla el estado del modal fullscreen de búsqueda y la selección activa de Pokémon.

### 4. Data Fetching, Paginación y Caché con TanStack Query + Axios
- **Caché y Reintentos:** Las consultas a PokeAPI implementan una política de caché declarativa (`staleTime: 5-10m`, `gcTime: 30m`) que evita peticiones repetitivas innecesarias a la API pública.
- **Scroll Infinito:** El buscador fullscreen implementa `useInfinitePokemonList` con `useInfiniteQuery` y un `IntersectionObserver` centinela que solicita lotes incrementales de 30 Pokémon (`offset += 30`), desconectando el observer al desmontar para evitar fugas de memoria.
- **Búsqueda Exacta y Debouncing:** Integración de un hook puro `useDebounce` (350ms) combinado con la normalización de texto (`normalizePokemonSearch`), eliminando caracteres especiales y evitando ráfagas de 404s en PokeAPI mientras se escribe.

### 5. Estrategia de Historial de Visitas (MF2)
- **Estructura de Datos:**
  ```typescript
  interface VisitedPokemon {
    name: string;
    image: string;
    visits: number;
  }
  ```
- **Deduplicación y Conteo:** La función pura `calculateUpdatedHistory` procesa cada apertura de detalle. Si el Pokémon ya ha sido visitado, incrementa su contador `visits` y lo sitúa al inicio de la lista; si es su primera visita, lo agrega con `visits: 1` sin generar duplicados.
- **Arquitectura Orientada a Eventos (EDA):** MF1 emite un evento desacoplado `CustomEvent(POKEMON_VISIT_EVENT)` en `window`. MF2 escucha este evento reactivamente para actualizar la vista en tiempo real. Adicionalmente, MF2 escucha el evento nativo `storage` del navegador para sincronizar el historial entre múltiples pestañas activas.

### 6. Estrategia de Toast al Recargar (Shell)
- **Persistencia de Visitas y Descarte:** El Shell almacena el último Pokémon visitado (`STORAGE_KEYS.LAST_VISITED`) y el registro de descarte (`STORAGE_KEYS.TOAST_DISMISSED`) con su respectiva marca temporal (`timestamp`).
- **Regla de Descarte Determinista:** Al recargar, el Toast únicamente se muestra si el timestamp de la última visita es mayor al timestamp del último descarte. Al cerrarlo, no vuelve a mostrarse hasta que el usuario visite un nuevo Pokémon.

### 7. Diseño, Responsive y Modo Claro / Oscuro con Tailwind CSS
- **Tokens de Diseño:** Coherencia estilística compartida entre Shell y Remotes mediante Tailwind CSS y modo oscuro controlado por la clase `.dark`.
- **Accesibilidad WCAG 2.2 AA:**
  - El modal de búsqueda incorpora atrapamiento de foco interactivo (*focus trap*) mediante teclas `Tab` y `Shift+Tab`.
  - Restauración automática del foco al elemento interactivo disparador al cerrar el modal.
  - Cierre con tecla `Escape` en modales y menús desplegables de usuario.

### 8. Organización Modular de la Suite de Pruebas (Vitest)
La suite de pruebas automatizadas está estructurada semánticamente por dominios dentro de la carpeta `tests/`:

```text
tests/
├── integration/                   # Pruebas de integración Shell-Remotes y Fault Tolerance
│   ├── remote_error_boundary.test.tsx
│   └── shell_microfrontend_integration.test.tsx
├── shell/                         # Pruebas de componentes, páginas y flujos del Shell Host
│   ├── auth_login.test.tsx
│   ├── category_section.test.tsx
│   ├── pokemon_card_image.test.tsx
│   ├── search_modal.test.tsx
│   ├── theme_navbar.test.tsx
│   └── toast_reload.test.tsx
├── mf-detail/                     # Pruebas del remote MF1 y custom hook de detalle
│   ├── mf1_pokemon_detail.test.tsx
│   └── use_pokemon_detail.test.ts
├── mf-history/                    # Pruebas del remote MF2 y lógica de persistencia
│   ├── history.test.ts
│   └── mf2_pokemon_history.test.tsx
├── unit/                          # Pruebas unitarias de utilidades y hooks puros
│   ├── search.test.ts
│   ├── toast.test.ts
│   └── use_debounce.test.ts
├── utils/                         # Wrappers y proveedores de prueba (QueryClient, Router)
│   └── test-wrapper.tsx
└── setup.ts                       # Setup global de Vitest y mocks de DOM (matchMedia, IntersectionObserver)
```

- **Cobertura Automatizada:** **88 pruebas pasando al 100%** en 15 suites de Vitest.
- **Tipado Estricto:** **0 errores de TypeScript** en todo el monorepo (cero `any`).
- **Linter:** **0 errores y 0 advertencias** en ESLint.
