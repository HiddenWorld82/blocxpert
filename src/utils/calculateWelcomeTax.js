// utils/calculateWelcomeTax.js

const calculateWelcomeTax = (price) => {
  const brackets = [
    { min: 0, max: 50000, rate: 0.005 },
    { min: 50000, max: 250000, rate: 0.01 },
    { min: 250000, max: 500000, rate: 0.015 },
    { min: 500000, max: 1000000, rate: 0.02 },
    { min: 1000000, max: Infinity, rate: 0.025 }
  ];

  let tax = 0;
  let remaining = price;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, bracket.max - bracket.min);
    tax += taxable * bracket.rate;
    remaining -= taxable;
  }

  return tax;
};

export default calculateWelcomeTax;
