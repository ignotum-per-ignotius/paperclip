export { OnboardingFeatureCard, type OnboardingFeatureCardProps } from "./OnboardingFeatureCard.js";
export { OnboardingPanel, type OnboardingPanelProps } from "./OnboardingPanel.js";
export {
  StaffFeaturesOnboarding,
  type StaffFeaturesOnboardingProps,
} from "./StaffFeaturesOnboarding.js";
export { createDemoOnboardingSnapshot } from "../demo-data.js";
export {
  buildOnboardingSnapshot,
  classifyTaskTiming,
  formatTaskTiming,
  summarizeOnboarding,
} from "../timing.js";
export type {
  OnboardingSnapshot,
  OnboardingSetupStep,
  OnboardingSummary,
  OnboardingTask,
  TaskTiming,
} from "../types.js";
