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

const UNITS = [
  ['101', 'Dos ambientes', 'Frente',       55, 10, 0, 5, 70, 120000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 1, '', '', ''],
  ['102', 'Dos ambientes', 'Contrafrente', 55, 10, 0, 5, 70, 110000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 1, '', '', ''],
  ['103', 'Tres ambientes', 'Frente',      75, 12, 0, 5, 92, 160000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 1, '', '', ''],
  ['201', 'Dos ambientes', 'Frente',       55, 10, 0, 5, 70, 125000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 2, '', '', ''],
  ['202', 'Dos ambientes', 'Lateral',      55, 10, 0, 5, 70, 115000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 2, '', '', ''],
  ['203', 'Tres ambientes', 'Frente',      75, 12, 0, 5, 92, 165000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 2, '', '', ''],
  ['C01', 'Cochera',       'Sin definir',  12,  0, 0, 0, 12,  15000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 0, '', '', ''],
  ['C02', 'Cochera',       'Sin definir',  12,  0, 0, 0, 12,  15000, 'USD', 'DISPONIBLE', '', '', '', '', '', '', '', '', 0, '', '', ''],
];

function generateTemplateXlsx() {
  const outputPath = path.resolve(__dirname, 'unit-template.xlsx');

  const worksheetData = [HEADERS, ...UNITS];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Unidades');
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
}

module.exports = { generateTemplateXlsx };

// Allow running directly: node generate-template.js
if (require.main === module) {
  const outputPath = generateTemplateXlsx();
  console.log(`Template generado: ${outputPath}`);
}
