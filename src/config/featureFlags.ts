const normalize = (value: string | undefined): string | undefined =>
  typeof value === 'string' ? value.trim().toLowerCase() : undefined;

const parseFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  const normalized = normalize(value);
  if (!normalized) return defaultValue;
  return ['1', 'true', 'yes', 'on', 'enable', 'enabled'].includes(normalized);
};

export const featureFlags = {
  aiChat: parseFlag(import.meta.env.VITE_FEATURE_AI_CHAT, false),
  ecount: parseFlag(import.meta.env.VITE_FEATURE_ECOUNT, true),
  docs: parseFlag(import.meta.env.VITE_FEATURE_DOCS, false),
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;

export const isFeatureEnabled = (key: FeatureFlagKey): boolean => featureFlags[key];
