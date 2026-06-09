const { generateTemplateXlsx } = require('../tests/fixtures/generate-template');

async function globalSetup() {
  generateTemplateXlsx();
}

module.exports = globalSetup;
