# JouleX Solar Quotations

Desktop application for professional solar installation quotation in Chile, built with Tauri 2, React 19 and TypeScript. The app is offline-first, uses a local SQLite database, and generates quotation PDFs.

---

## Product Goal

JouleX Solar Quotations guides a solar installer through a complete quotation workflow:

1. **Cliente** - client identity, address, tariff and commercial context.
2. **Consumo** - monthly consumption, demand values and energy prices from the utility bill.
3. **Dimensionamiento** - solar generation, panel count, system type and calculation results.
4. **Productos** - component selection from an editable local catalog.
5. **Cotizacion** - final preview, history save and PDF generation.

The workflow is linear with free backward navigation. Moving forward requires validation of the current step. Jumping forward to locked steps is not allowed.

---

## Supported System Types

- **On-Grid Pure**: grid-tied system with net billing and injection credits.
- **Hybrid Residential**: grid-tied system plus battery bank with daily charge/discharge simulation.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Desktop shell | Tauri 2 | Small installer, OS WebView, native capabilities |
| Frontend | React 19 + Vite | Modern UI workflow and fast development |
| Styling | Tailwind CSS v4 + shadcn/ui | Customizable professional UI components |
| State | Zustand | Lightweight global quotation state |
| Forms | react-hook-form + zod | Type-safe step validation |
| Database | SQLite via tauri-plugin-sql | Local file, no server, offline-first |
| PDF | @react-pdf/renderer | Declarative React PDF layout, vector output |
| Language | TypeScript + Rust | Type safety on frontend and backend |

---

## Current Architecture Target

```text
src/
|-- app/                         # App shell: sidebar, topbar, footer
|-- features/                    # Domain modules and workflow steps
|   |-- cliente/
|   |-- consumo/
|   |-- dimensionamiento/
|   |-- productos/
|   |-- cotizacion/
|   |-- historial/
|   |-- catalogo/
|   |-- configuracion/
|-- store/                       # Zustand stores
|-- services/                    # Tauri, DB and PDF wrappers
|-- types/                       # TypeScript domain types
|-- components/
|   |-- ui/                      # shadcn/base-ui components
|   |-- common/                  # App-specific shared components
|-- lib/                         # Constants, formatters, months, utils

src-tauri/
|-- src/                         # Rust entrypoint and future commands
|-- capabilities/                # Tauri permissions
```

---

## Database

SQLite is stored locally in the application data directory. The core tables are:

- `productos`: editable product catalog.
- `cotizaciones`: quotation history with a full JSON snapshot.
- `parametros`: editable defaults such as tariffs, losses, DOD and company data.

See [database.md](./database.md).

---

## Calculation Engine

The solar engine will be implemented as pure typed TypeScript functions under `src/features/dimensionamiento/`.

- `calculos.ts`: on-grid model.
- `calculosHibrido.ts`: hybrid model.

See [solar-calculations.md](./solar-calculations.md).

---

## PDF

PDF generation uses `@react-pdf/renderer`. The first version uses a fixed template with client data, calculation results, products and totals. Branding is intentionally deferred.

See [pdf-template.md](./pdf-template.md).

---

## Getting Started

Requirements:

- Node.js 20+
- Rust 1.88+
- Windows, macOS or Linux

```bash
npm install
npm run tauri dev
npm run tauri build
```

The production installer is generated under `src-tauri/target/release/bundle/`.

---

## Documentation

| Document | Description |
|---|---|
| [Design Decisions](./decisions.md) | Current technical and product decisions |
| [Architecture](./architecture.md) | App structure, data flow and Tauri boundaries |
| [Database Schema](./database.md) | SQLite tables and default parameters |
| [Solar Calculation Logic](./solar-calculations.md) | Business formulas and calculation rules |
| [PDF Template](./pdf-template.md) | PDF generation approach and first template |
