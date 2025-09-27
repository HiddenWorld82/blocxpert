export const getAphMaxLtvRatio = (points = 0) => {
  if (points >= 100) return 0.95;
  if (points >= 70) return 0.90;
  return 0.85;
};

export default getAphMaxLtvRatio;
