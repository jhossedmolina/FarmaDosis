export type CriDoseRateUnit = 'ug/kg/min' | 'ug/kg/h' | 'mg/kg/h';

export interface CriInput {
  patientWeightKg: number | string;
  doseRate: number | string;
  doseRateUnit: CriDoseRateUnit;
  vialConcentrationMgMl: number | string;
  bagVolumeMl: number | string;
  bagCount: number | string;
  infusionRateMlHour: number | string;
}

export interface CriResult {
  drugRequiredMgHour: number;
  targetBagConcentrationMgMl: number;
  infusionRateMlHour: number;
  medicationVolumeMl: number;
  serumVolumeToRemoveMl: number;
  bagDurationHours: number;
  totalTreatmentDurationHours: number;
  instruction: string;
  warnings: readonly string[];
}

export interface CriValidationIssue {
  field: keyof CriInput;
  message: string;
}
