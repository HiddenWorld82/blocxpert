export const cloneScenario = (scenario) => {
  const { id, title, ...rest } = scenario;
  return {
    ...rest,
    title: title ? `${title} (copie)` : 'Copie',
  };
};

