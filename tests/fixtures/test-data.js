const uniqueSuffix = () => Date.now().toString().slice(-6);

module.exports = {
  credentials: {
    email: process.env.USER_EMAIL || '',
    password: process.env.USER_PASSWORD || '',
  },

  projects: {
    valid: {
      name: () => `Proyecto Test ${uniqueSuffix()}`,
    },
    withoutName: {
      name: '',
    },
  },

  units: {
    valid: {
      name: () => `Unidad ${uniqueSuffix()}`,
      floor: '1',
      type: 'Departamento',
      surface: '65',
    },
    minimal: {
      name: () => `U-${uniqueSuffix()}`,
    },
  },

  prices: {
    initial: '100000',
    updated: '150000',
    high: '500000',
  },
};
