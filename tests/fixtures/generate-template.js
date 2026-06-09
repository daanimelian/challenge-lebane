const XLSX = require('xlsx');
const path = require('path');

const HEADERS = [
  'Numero de unidad (*)',
  'Tipologia (*)',
  'Orientacion (*)',
  'M2 cubiertos (*)',
  'M2 semi cubiertos (*)',
  'M2 descubiertos (*)',
  'M2 Comunes (*)',
  'M2 totales (*)',
  'Precio (*)',
  'Moneda (*)',
  'Estado (*)',
  'Saldo financiado A',
  'Abonado A',
  'Saldo financiado B',
  'Abonado B',
  'Canal de venta',
  'Canal contactacion',
  'Saldo moroso',
  'Dias atraso',
  'Piso (*)',
  'TipoPropietario',
  'Moneda alquiler',
  'Valor alquiler',
];

// Column index reference (0-based):
// 0  Numero de unidad (*)
// 1  Tipologia (*)
// 2  Orientacion (*)
// 3  M2 cubiertos (*)
// 4  M2 semi cubiertos (*)
// 5  M2 descubiertos (*)
// 6  M2 Comunes (*)
// 7  M2 totales (*)
// 8  Precio (*)
// 9  Moneda (*)
// 10 Estado (*)
// 11 Saldo financiado A  → int, operation balance
// 12 Abonado A          → fixed "DISPONIBLE"
// 13 Saldo financiado B → fixed 0
// 14 Abonado B          → empty (NaN)
// 15 Canal de venta     → empty (NaN)
// 16 Canal contactacion → fixed "PROPIETARIO"
// 17 Saldo moroso       → empty (NaN)
// 18 Dias atraso        → empty (NaN)
// 19 Piso (*)           → empty (NaN) — matches system real behavior
// 20 TipoPropietario    → fixed "PROPIETARIO"
// 21 Moneda alquiler    → fixed "ARS"
// 22 Valor alquiler     → empty (NaN)
const E = null; // sentinel for empty (NaN) cells

const UNITS = [
  //  unit id         tipologia         orientacion      cub  scub desc  com  tot     precio   moneda       estado  saldoA   abonadoA      saldoB  aboB  cventa  contacto  moroso  atraso  piso   tipoprop      moneda_alq  val_alq
  ['101',         'Dos ambientes',   'Frente',           55,  10,   0,   5,  70, 120000, 'USD', 'DISPONIBLE', 108000, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['102',         'Dos ambientes',   'Contrafrente',     55,  10,   0,   5,  70, 110000, 'USD', 'DISPONIBLE',  84000, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['103',         'Tres ambientes',  'Frente',           75,  12,   0,   5,  92, 160000, 'USD', 'DISPONIBLE', 120000, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['201',         'Dos ambientes',   'Frente',           55,  10,   0,   5,  70, 125000, 'USD', 'DISPONIBLE',  96000, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['202',         'Dos ambientes',   'Lateral',          55,  10,   0,   5,  70, 115000, 'USD', 'DISPONIBLE',   6000, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['203',         'Tres ambientes',  'Frente',           75,  12,   0,   5,  92, 165000, 'USD', 'DISPONIBLE', 132000, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['Cochera 1',   'Cochera',         'Sin definir',      12,   0,   0,   0,  12,  15000, 'USD', 'DISPONIBLE',      0, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
  ['Cochera 2',   'Cochera',         'Sin definir',      12,   0,   0,   0,  12,  15000, 'USD', 'DISPONIBLE',      0, 'DISPONIBLE', 0, E, E, 'PROPIETARIO', E, E, E, 'PROPIETARIO', 'ARS', E],
];

const HIDDEN_SHEETS = {
  hiddenTipoUnidad: [
    'Baulera', 'Cinco ambientes', 'Cochera', 'Cuatro ambientes', 'Cuatro dormitorios',
    'Diez ambientes', 'Dos ambientes', 'Dos dormitorios', 'Local', 'Lote',
    'Mas de diez ambientes', 'Monoambiente', 'Monoambiente divisible', 'Nueve ambientes',
    'Ocho ambientes', 'Oficina', 'Otros', 'Seis ambientes', 'Siete ambientes',
    'Sin definir', 'Terraza privada', 'Terreno', 'Tres ambientes', 'Tres dormitorios',
    'Un dormitorio', 'Unidad',
  ],
  hiddenOrientacion: ['Contrafrente', 'Frente', 'Interno', 'Lateral', 'Sin definir'],
  hiddenMoneda: ['ARS', 'COP', 'EUR', 'MXN', 'PYG', 'USD', 'UYU'],
  hiddenEstado: ['DISPONIBLE', 'VENDIDO', 'ENTREGADO', 'RESERVADO', 'ALQUILADO', 'BLOQUEADO'],
  hiddenPropietario: ['PROPIETARIO', 'INVERSOR'],
};

function generateTemplateXlsx() {
  const outputPath = path.resolve(__dirname, 'unit-template.xlsx');
  const workbook = XLSX.utils.book_new();

  // Main sheet
  const worksheetData = [HEADERS, ...UNITS];
  const mainSheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Unidades');

  // Hidden validation sheets — one value per row, no header
  for (const [sheetName, values] of Object.entries(HIDDEN_SHEETS)) {
    const sheetData = values.map((v) => [v]);
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }

  XLSX.writeFile(workbook, outputPath);
  return outputPath;
}

module.exports = { generateTemplateXlsx };

// Allow running directly: node generate-template.js
if (require.main === module) {
  const outputPath = generateTemplateXlsx();
  console.log(`Template generado: ${outputPath}`);
}
