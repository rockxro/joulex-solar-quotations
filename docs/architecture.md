# Architecture

JouleX Solar Quotations uses a feature-based React frontend inside a Tauri desktop shell. The app is offline-first: no cloud dependency and no network requirement for normal operation.

---

## Application Shape

```text
React frontend (src/)
  app shell
  features
  store
  services
        |
        | Tauri JS API / plugin APIs
        v
Tauri backend (src-tauri/)
  capabilities
  SQLite plugin
  future native commands
```

The frontend owns UI, state, validation, calculations and PDF composition. Tauri provides native shell behavior, local SQLite access and future filesystem operations.

---

## Workflow

The quotation flow has five steps:

```text
Cliente -> Consumo -> Dimensionamiento -> Productos -> Cotizacion
```

Rules:

- Moving forward requires the active step to validate with zod.
- Moving backward is always allowed and keeps state.
- Jumping forward to locked steps is blocked.
- The sidebar shows completed, active and locked states.

---

## Layout

The app uses a persistent desktop shell:

```text
Sidebar | Topbar
        | Main content
        | Footer navigation
```

Sidebar entries:

- Workflow steps 1 to 5.
- Historial.
- Catalogo.
- Configuracion.

Topbar shows:

- Active step or section.
- Selected system type.
- Current client name when available.

Footer shows:

- `Anterior`.
- `Siguiente`.
- Current validation/help message.

---

## Frontend Modules

```text
src/app/
```

Shell-level components such as sidebar, topbar and workflow footer.

```text
src/features/
```

Domain modules:

- `cliente`: client identity and tariff context.
- `consumo`: utility bill consumption and prices.
- `dimensionamiento`: solar generation inputs and calculations.
- `productos`: quotation product line selection.
- `cotizacion`: final preview and PDF generation.
- `historial`: saved quotations.
- `catalogo`: editable local product catalog.
- `configuracion`: parameters and installer company data.

```text
src/store/
```

Zustand stores for active quotation state and catalog cache.

```text
src/services/
```

Thin wrappers for Tauri APIs, SQLite and PDF generation.

```text
src/types/
```

Shared TypeScript domain models.

```text
src/lib/
```

Constants, months, CLP formatting and common utilities.

```text
src/components/
```

Shared UI and layout components:
- `ui/`: Reusable atomic UI components (e.g., `Button.tsx`, `InputField.tsx`, `SelectField.tsx`) compatible with React Hook Form using `React.forwardRef`.
- `common/`: Shared layout and wrapper components (e.g., `PlaceholderPanel.tsx`).

---

## Data Flow

```text
User input
  -> feature form
  -> zod validation
  -> Zustand store
  -> pure calculation functions
  -> service layer
  -> SQLite / PDF / filesystem
```

The calculation engine should remain pure and testable. UI components should call calculation functions through feature-level orchestration, not embed formulas inside JSX.

---

## Persistence

SQLite is accessed with `@tauri-apps/plugin-sql` and `tauri-plugin-sql`.

Initial scope:

- Prepare plugin and permissions.
- Keep migrations and CRUD services minimal until the database feature is implemented.

Future scope:

- Initialize schema on first launch.
- Seed default products and parameters.
- Store complete quotation snapshots.

---

## Branding and Installer Profile

JouleX Solar Quotations is the software identity. The installer company is a configurable local profile used for commercial documents and quotation output.

The configuration module owns installer data such as:

- Company name.
- RUT or tax identifier.
- Phone.
- Email.
- Address.

PDFs and quotations should use this installer profile in headers and commercial sections. Public docs and source code must not include real private company or client data.

---

## Security Model

Tauri capabilities should stay minimal. Current planned permissions:

- `core:default`
- `opener:default`
- `sql:default`

No network permissions are part of the intended offline-first product.
