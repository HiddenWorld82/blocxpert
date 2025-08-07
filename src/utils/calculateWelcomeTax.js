// utils/calculateWelcomeTax.js

const calculateWelcomeTax = (price) => {
  const brackets = [
    { min: 0, max: 61500, rate: 0.005 },
    { min: 61500, max: 307800, rate: 0.01 },
    { min: 307800, max: 601525, rate: 0.015 },
    { min: 601525, max: Infinity, rate: 0.03 },
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
