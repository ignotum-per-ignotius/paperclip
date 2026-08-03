import { useState } from "react";
import type { OnboardingSnapshot } from "../types.js";
import { createDemoOnboardingSnapshot } from "../demo-data.js";
import { OnboardingFeatureCard } from "./OnboardingFeatureCard.js";
import { OnboardingPanel } from "./OnboardingPanel.js";

export type StaffFeaturesOnboardingProps = {
  snapshot?: OnboardingSnapshot;
  /** Controlled open state; omit for internal toggle */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  isDemo?: boolean;
};

/**
 * Drop-in replacement for the Staff Features Onboarding tile.
 * Card view shows setup + overdue pressure; Open reveals the full panel.
 */
export function StaffFeaturesOnboarding({
  snapshot = createDemoOnboardingSnapshot(),
  open,
  onOpenChange,
  className,
  isDemo,
}: StaffFeaturesOnboardingProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (open === undefined) setInternalOpen(next);
  };

  if (isOpen) {
    return (
      <OnboardingPanel
        snapshot={snapshot}
        isDemo={isDemo}
        className={className}
        onBack={() => setOpen(false)}
      />
    );
  }

  return (
    <OnboardingFeatureCard
      snapshot={snapshot}
      className={className}
      onOpen={() => setOpen(true)}
    />
  );
}
