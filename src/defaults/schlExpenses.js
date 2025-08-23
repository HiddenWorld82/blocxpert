const schlExpenses = {
  QC: {
    woodFrame: {
      small: {
        maintenance: 610,
        managementRate: 4.25,
        salaries: 215,
        replacementReserve: {
          appliance: 60,
          heatPump: 190,
          elevator: 300,
        },
      },
      large: {
        maintenance: 610,
        managementRate: 5,
        salaries: 365,
        replacementReserve: {
          appliance: 60,
          heatPump: 190,
          elevator: 300,
        },
      },
    },
    concrete: {
      any: {
        maintenance: 925,
        managementRate: 5,
        salaries: 610,
        replacementReserve: {
          appliance: 60,
          heatPump: 190,
        },
      },
    },
  },
};

export default schlExpenses;
