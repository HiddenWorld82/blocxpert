const atlantic = {
  woodFrame: {
    small: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 420,
      otherCostRate: 1,
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
      otherCostRate: 1,
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
      otherCostRate: 1.3,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
      },
    },
  },
};

const ontario = {
  woodFrame: {
    small: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 555,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
    large: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 555,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
  },
  concrete: {
    any: {
      maintenance: 975,
      managementRate: 4.25,
      salaries: 700,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
      },
    },
  },
};

const prairies = {
  woodFrame: {
    small: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 500,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
    large: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 500,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
  },
  concrete: {
    any: {
      maintenance: 975,
      managementRate: 4.25,
      salaries: 665,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
      },
    },
  },
};

const britishColumbia = {
  woodFrame: {
    small: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 635,
      otherCostRate: 1.7,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
    large: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 635,
      otherCostRate: 1.7,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300,
      },
    },
  },
  concrete: {
    any: {
      maintenance: 975,
      managementRate: 4.25,
      salaries: 700,
      otherCostRate: 1.8,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
      },
    },
  },
};

const quebec = {
    woodFrame: {
    small: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 215,
      otherCostRate: 0,
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
      otherCostRate: 0,
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
      otherCostRate: 0,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
      },
    },
  },
};
const schlExpenses = {
  NB: atlantic,
  NS: atlantic,
  PE: atlantic,
  NL: atlantic,
  ON: ontario,
  MB: prairies,
  SK: prairies,
  AB: prairies,
  BC: britishColumbia,
  NT: prairies,
  NU: prairies,
  YT: prairies,
  QC: quebec,
};

export default schlExpenses;
