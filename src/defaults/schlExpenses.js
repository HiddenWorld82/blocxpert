const atlantic = {
  woodFrame: {
    small: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 420,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
    large: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 420,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
  },
  concrete: {
    any: {
      maintenance: 825,
      managementRate: 4.25,
      salaries: 610,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
      },
    },
  },
};

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
  NB: atlantic,
  NS: atlantic,
  PE: atlantic,
  NL: atlantic,
};

export default schlExpenses;
