/**
 * Personas that act as "brokers": they have clients, see client properties,
 * and get the broker UI (Mes clients, partage avec le courtier, etc.).
 */
export const BROKER_PERSONAS = ['courtier_hypo', 'courtier_immo', 'preteur_prive'];

/**
 * @param {string} [persona]
 * @returns {boolean}
 */
export function isBrokerPersona(persona) {
  return Boolean(persona && BROKER_PERSONAS.includes(persona));
}
