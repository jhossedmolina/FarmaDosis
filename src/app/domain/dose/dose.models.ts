export type DoseUnit = 'mg/kg' | 'ml/kg';
export type DosePresentation = 'none' | 'solution' | 'tablet';
export type DoseConcentrationUnit = 'mg/ml' | 'ml/ml' | 'mg/tablet';

export interface DoseInput {
  patientWeightKg: number | string;
  dosePerKg: number | string;
  doseUnit: DoseUnit;
  presentation: DosePresentation;
  concentration?: number | string | null;
  concentrationUnit?: DoseConcentrationUnit | null;
}

export interface DoseResult {
  totalDose: number;
  totalDoseUnit: 'mg' | 'ml';
  physicalAmount?: number;
  physicalAmountUnit?: 'ml' | 'tablet';
  displayAmount?: string;
  instruction: string;
  warnings: readonly string[];
}

export interface DoseValidationIssue {
  field: keyof DoseInput;
  message: string;
}
