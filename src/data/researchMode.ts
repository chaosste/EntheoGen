import type { UIInteraction } from './uiInteractions';

export type ResearchModeFilters = {
  showUnknownRisk: boolean;
  showUnknownMechanism: boolean;
  showUnknownConfidence: boolean;
};

const includesText = (value: string, token: string) => value.toLowerCase().includes(token.toLowerCase());

export function filterInteractionsForResearchMode(
  interactions: UIInteraction[],
  filters: ResearchModeFilters
): UIInteraction[] {
  const hasActiveFilter =
    filters.showUnknownRisk || filters.showUnknownMechanism || filters.showUnknownConfidence;

  if (!hasActiveFilter) {
    return interactions;
  }

  return interactions.filter((interaction) => {
    if (filters.showUnknownRisk) {
      const hasUnknownRisk =
        interaction.riskScore === null ||
        includesText(interaction.riskDisplayLabel, 'not yet assessed') ||
        includesText(interaction.riskDisplayLabel, 'not scored');
      if (!hasUnknownRisk) return false;
    }

    if (filters.showUnknownMechanism) {
      const hasUnknownMechanism =
        interaction.mechanismDisplayLabel === 'Mechanism not yet classified';
      if (!hasUnknownMechanism) return false;
    }

    if (filters.showUnknownConfidence) {
      const hasUnknownConfidence = includesText(interaction.confidenceLabel, 'not yet assessed');
      if (!hasUnknownConfidence) return false;
    }

    return true;
  });
}
