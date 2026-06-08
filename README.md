# QA Automation - Lebane

Proyecto de automatización de pruebas para el sistema de gestión de listas de precios y unidades de Lebane.

---

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

---

## Setup

### 1. Clonar el repositorio

```bash
git clone https://github.com/daanimelian/challenge-lebane.git
cd challenge-lebane
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar browsers de Playwright

```bash
npm run install:browsers
```

### 4. Configurar variables de entorno

Copiar el archivo de ejemplo y completar con las credenciales reales:

```bash
cp .env.example .env
```

Editar `.env`:

```env
BASE_URL=https://tst.lebane.app
USER_EMAIL=tu_email@example.com
USER_PASSWORD=tu_password
HEADLESS=true
TIMEOUT=30000
```

> El archivo `.env` nunca debe commitearse. Ya está incluido en `.gitignore`.

---

## Ejecutar tests

### Todos los tests

```bash
npm test
```

### Con browser visible

```bash
npm run test:headed
```

### Modo debug (paso a paso)

```bash
npm run test:debug
```

### UI interactiva de Playwright

```bash
npm run test:ui
```

### Por test case

```bash
npm run test:tc001   # TC-001: Crear Proyecto
npm run test:tc002   # TC-002: Crear Unidades
npm run test:tc003   # TC-003: Modificar Precio
npm run test:tc004   # TC-004: Cargar Template
npm run test:tc005   # TC-005: Eliminar Unidad (normal)
npm run test:tc006   # TC-006: Eliminar última unidad
```

### Para CI/CD

```bash
npm run test:ci
```

---

## Ver reportes

Después de ejecutar los tests, abrir el reporte HTML:

```bash
npm run test:report
```

Los reportes se generan en:

```
reports/
├── html/          # Reporte HTML interactivo
├── json/          # Resultados en JSON (para CI/CD)
├── junit/         # Resultados en XML (para integración con herramientas CI)
└── artifacts/     # Screenshots y videos de fallos
```

> La carpeta `reports/` no se commitea al repositorio. Se genera automáticamente al correr los tests.

---

## Estructura del proyecto

```
challenge-lebane/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline de GitHub Actions
├── config/
│   ├── playwright.config.js    # Configuración principal de Playwright
│   └── environments.js         # Variables de entorno y timeouts
├── tests/
│   ├── specs/                  # Archivos de test por caso de prueba
│   │   ├── 01-project-creation.spec.js
│   │   ├── 02-price-list-management.spec.js
│   │   ├── 04-template-loading.spec.js
│   │   └── 05-unit-deletion.spec.js
│   ├── pages/                  # Page Objects (patrón POM)
│   │   ├── BasePage.js
│   │   ├── LoginPage.js
│   │   ├── ProjectPage.js
│   │   ├── UnitsPage.js
│   │   └── PriceListPage.js
│   └── fixtures/               # Datos de prueba
│       ├── test-data.js
│       └── templates.json
├── utils/
│   ├── logger.js               # Logger con niveles INFO/WARN/ERROR
│   └── helpers.js              # Funciones utilitarias
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
└── package.json
```

---

## Casos de prueba

| TC | Descripción | Archivo |
|----|-------------|---------|
| TC-001 | Crear proyecto y verificar lista de precios inicial | `01-project-creation.spec.js` |
| TC-002 | Crear unidades via formulario y verificar en lista de precios | `02-price-list-management.spec.js` |
| TC-003 | Modificar precio de lista y verificar actualización | `02-price-list-management.spec.js` |
| TC-004 | Cargar template y verificar nueva lista de precios | `04-template-loading.spec.js` |
| TC-005 | Eliminar unidad y verificar que la lista de precios se mantiene | `05-unit-deletion.spec.js` |
| TC-006 | Eliminar última unidad y verificar que la lista de precios se elimina | `05-unit-deletion.spec.js` |

---

## GitHub Actions

El pipeline se ejecuta automáticamente en cada push a `main` y en pull requests.

Las credenciales se configuran como secrets en el ambiente `TEST` de GitHub:

- `BASE_URL`
- `USER_EMAIL`
- `USER_PASSWORD`

Para configurarlos: **Settings > Environments > TEST > Environment secrets**

---

## Troubleshooting

### Los tests fallan con "elemento no encontrado"

Los selectores están definidos con `TODO` en los page objects y pueden necesitar ajuste según la versión actual de la app. Correr `npx playwright codegen https://tst.lebane.app` para obtener selectores actualizados.

### Error: "Cannot find module"

Verificar que las dependencias estén instaladas:

```bash
npm install
```

### El browser no abre en modo headed

Verificar que `HEADLESS=false` esté en el `.env` o correr con:

```bash
npm run test:headed
```

### Los tests fallan por timeout

Aumentar los valores en `.env`:

```env
TIMEOUT=60000
NAVIGATION_TIMEOUT=60000
ACTION_TIMEOUT=15000
```

### Ver qué pasó en un test fallido

Los screenshots y videos de fallos se guardan automáticamente en `reports/artifacts/`.

---

## Contribución

1. Crear una rama desde `main`
2. Nombrar la rama según el tipo de cambio: `feat/`, `fix/`, `test/`, `docs/`
3. Mantener el patrón Page Object Model para cualquier nuevo page object
4. Los selectores van siempre en el page object, nunca en el spec
5. Usar `logger.step()` para marcar pasos en los tests
6. Nunca commitear el archivo `.env`
