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
        elevator: 300
      }
    },
    large: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 420,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    }
  },
  concrete: {
    any: {
      maintenance: 825,
      managementRate: 4.25,
      salaries: 610,
      otherCostRate: 1.3,
      replacementReserve: {
        appliance: 60,
        heatPump: 190
      }
    }
  }
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
        elevator: 300
      }
    },
    large: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 555,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    }
  },
  concrete: {
    any: {
      maintenance: 975,
      managementRate: 4.25,
      salaries: 700,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190
      }
    }
  }
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
        elevator: 300
      }
    },
    large: {
      maintenance: 830,
      managementRate: 4.25,
      salaries: 500,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    }
  },
  concrete: {
    any: {
      maintenance: 975,
      managementRate: 4.25,
      salaries: 665,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190
      }
    }
  }
};

const britishColumbia = {
  woodFrame: {
    small: {
      maintenance: 980,
      managementRate: 4.25,
      salaries: 600,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    },
    large: {
      maintenance: 980,
      managementRate: 4.25,
      salaries: 600,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    }
  },
  concrete: {
    any: {
      maintenance: 1_200,
      managementRate: 4.25,
      salaries: 775,
      otherCostRate: 2,
      replacementReserve: {
        appliance: 60,
        heatPump: 190
      }
    }
  }
};

const quebec = {
  woodFrame: {
    small: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 420,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    },
    large: {
      maintenance: 610,
      managementRate: 4.25,
      salaries: 420,
      otherCostRate: 1,
      replacementReserve: {
        appliance: 60,
        heatPump: 190,
        elevator: 300
      }
    }
  },
  concrete: {
    any: {
      maintenance: 790,
      managementRate: 4.25,
      salaries: 610,
      otherCostRate: 1.5,
      replacementReserve: {
        appliance: 60,
        heatPump: 190
      }
    }
  }
};

const schlExpenses = {
  QC: quebec,
  ON: ontario,
  NB: atlantic,
  NS: atlantic,
  PE: atlantic,
  NL: atlantic,
  MB: prairies,
  SK: prairies,
  AB: prairies,
  BC: britishColumbia
};

export default schlExpenses;
