# Database Schema

JouleX Solar Quotations uses SQLite as a local offline database. The file is expected to live in the application data directory.

Typical locations:

- Windows: `C:\Users\{user}\AppData\Roaming\com.joulex.solar-quotations\cotizador.db`
- macOS: `~/Library/Application Support/com.joulex.solar-quotations/cotizador.db`
- Linux: `~/.local/share/com.joulex.solar-quotations/cotizador.db`

---

## Tables

### `productos`

Editable product catalog used in the product selection step.

```sql
CREATE TABLE productos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  categoria   TEXT    NOT NULL,
  potencia_w  REAL,
  precio      REAL    NOT NULL,
  unidad      TEXT    NOT NULL DEFAULT 'unidad',
  activo      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

Valid categories:

- `panel`
- `inversor`
- `bateria`
- `estructura`
- `cable`
- `otro`

`activo = 0` works as a soft delete so historical quotations keep their product references.

---

### `cotizaciones`

Saved quotation history. Each row stores a full JSON snapshot so old quotations can be reopened exactly as they were created.

```sql
CREATE TABLE cotizaciones (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente      TEXT    NOT NULL,
  rut          TEXT,
  direccion    TEXT,
  tipo_sistema TEXT    NOT NULL,
  n_paneles    INTEGER,
  potencia_kw  REAL,
  total        REAL,
  fecha        TEXT    NOT NULL DEFAULT (datetime('now')),
  pdf_path     TEXT,
  datos_json   TEXT    NOT NULL
);
```

Valid `tipo_sistema` values:

- `ongrid`
- `hibrido`

---

### `parametros`

Editable system configuration.

```sql
CREATE TABLE parametros (
  clave       TEXT PRIMARY KEY,
  valor       TEXT    NOT NULL,
  descripcion TEXT
);
```

Default seed values:

| Key | Default | Description |
|---|---:|---|
| `precio_compra_default` | `143` | Default buy tariff in CLP/kWh |
| `precio_inyeccion_default` | `70` | Default injection price in CLP/kWh |
| `factor_perdidas` | `0.85` | System losses factor |
| `pct_consumo_laboral` | `0.9` | Solar-hours consumption on workdays |
| `pct_consumo_descanso` | `0.1` | Solar-hours consumption on rest days |
| `dias_laborales` | `5` | Workdays per week |
| `dias_descanso` | `2` | Rest days per week |
| `dod_bateria` | `0.8` | Battery depth of discharge |
| `empresa_nombre` | `` | Installer company name |
| `empresa_rut` | `` | Installer company RUT |
| `empresa_telefono` | `` | Contact phone |
| `empresa_email` | `` | Contact email |
| `empresa_direccion` | `` | Installer company address |

These installer company values are local configuration, not JouleX branding. They are used in quotations and PDFs so each installer can present its own commercial identity.

---

## Common Queries

Load active catalog:

```sql
SELECT * FROM productos WHERE activo = 1 ORDER BY categoria, nombre;
```

Save quotation:

```sql
INSERT INTO cotizaciones (
  cliente,
  rut,
  direccion,
  tipo_sistema,
  n_paneles,
  potencia_kw,
  total,
  datos_json
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

Get quotation history:

```sql
SELECT id, cliente, tipo_sistema, total, fecha, pdf_path
FROM cotizaciones
ORDER BY fecha DESC
LIMIT 50;
```

Reopen quotation:

```sql
SELECT datos_json FROM cotizaciones WHERE id = ?;
```
