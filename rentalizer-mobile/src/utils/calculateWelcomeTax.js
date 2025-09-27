const calculateWelcomeTax = (purchasePrice) => {
  const brackets = [
    { limit: 50999.99, rate: 0.005 },
    { limit: 254999.99, rate: 0.01 },
    { limit: 499999.99, rate: 0.015 },
    { limit: 999999.99, rate: 0.02 },
    { limit: Infinity, rate: 0.025 }
  ];

  let remaining = purchasePrice;
  let total = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableAmount = Math.min(bracket.limit - previousLimit, remaining);
    total += taxableAmount * bracket.rate;
    remaining -= taxableAmount;
    previousLimit = bracket.limit;
  }

  return total;
};

export default calculateWelcomeTax;
