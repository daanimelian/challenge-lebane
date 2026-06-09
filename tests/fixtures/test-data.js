require('dotenv').config();

const uniqueSuffix = () => Date.now().toString().slice(-6);

module.exports = {
  credentials: {
    email: process.env.USER_EMAIL || '',
    password: process.env.USER_PASSWORD || '',
  },

  projects: {
    valid: {
      name: () => `Proyecto Test ${uniqueSuffix()}`,
      currency: 'ARS',
      country: 'Argentina',
      province: 'Buenos Aires',
      city: 'De Mayo',
      address: 'Av. Test',
      doorNumber: '123',
      type: 'Edificio',
      adjustmentMode: 'Disponible al vencimiento',
      company: 'CRIBA S.A.',
    },
  },

  units: {
    valid: {
      pricePerSqm: '12',
      expectedProfit: '1',
      floors: '5',
      basements: '1',
      typologies: ['Dos ambientes', 'Monoambiente'],
      unitsPerFloor: '3',
      parkingSpaces: '1',
    },
  },

  prices: {
    initial: '12',
    updated: '20',
  },
};
