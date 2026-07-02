export const colors = {
  ink: "#0F0F10",
  paper: "#F4F1EC",
  grayOnDark: "#8C8884",
  sand: "#E5DACE",
  inkOnSand: "#141110",
  mutedOnSand: "#83766A",
  tan: "#D9C4A8",
  gold: "#B8935B",
  redUrgent: "#E0473A",
} as const;

export type ColorToken = keyof typeof colors;
