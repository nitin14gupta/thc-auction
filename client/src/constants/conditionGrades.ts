import type { ConditionGrade } from "@/types/listing";

export type ConditionGradeConfig = {
  code: ConditionGrade;
  label: string;
  description: string;
};

export const conditionGrades: ConditionGradeConfig[] = [
  { code: "DS", label: "DS", description: "Brand new, never worn with original tags" },
  { code: "VNDS", label: "VNDS", description: "Brand new, never worn with replacement tags" },
  { code: "USED", label: "USED", description: "Visible signs of wear, but no major flaws" },
  { code: "BEAT", label: "BEAT", description: "Heavily worn with noticeable wears" },
];
