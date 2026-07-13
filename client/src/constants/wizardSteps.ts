export type WizardStepConfig = {
  step: number;
  label: string;
  path: string;
};

export const wizardSteps: WizardStepConfig[] = [
  { step: 1, label: "Product", path: "/dashboard/create-listing/product" },
  { step: 2, label: "Details", path: "/dashboard/create-listing/details" },
  { step: 3, label: "Condition", path: "/dashboard/create-listing/condition" },
  { step: 4, label: "Photos", path: "/dashboard/create-listing/photos" },
  { step: 5, label: "Pricing", path: "/dashboard/create-listing/pricing" },
  { step: 6, label: "Review", path: "/dashboard/create-listing/review" },
];
