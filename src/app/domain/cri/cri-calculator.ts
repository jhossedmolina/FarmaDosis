import { isPositive, roundToTwo, toNumber } from '../dose/dose-calculator';
import { PROFESSIONAL_USE_WARNING } from '../safety/safety-copy';
import { CriDoseRateUnit, CriInput, CriResult, CriValidationIssue } from './cri.models';

const CRI_UNIT_WARNING =
  'El SRS original no fija una unidad temporal CRI; este calculo exige ug/kg/min, ug/kg/h o mg/kg/h.';

export function calculateCri(input: CriInput): CriResult | null {
  if (validateCriInput(input).length > 0) {
    return null;
  }

  const patientWeightKg = toNumber(input.patientWeightKg);
  const doseRate = toNumber(input.doseRate);
  const vialConcentrationMgMl = toNumber(input.vialConcentrationMgMl);
  const bagVolumeMl = toNumber(input.bagVolumeMl);
  const bagCount = toNumber(input.bagCount);
  const infusionRateInput = toNumber(input.infusionRateMlHour);

  const drugRequiredMgHour = roundToTwo(
    convertDoseRateToMgKgHour(doseRate, input.doseRateUnit) * patientWeightKg,
  );
  const targetBagConcentrationMgMl = roundToTwo(drugRequiredMgHour / infusionRateInput);
  const medicationVolumeMl = roundToTwo(
    (targetBagConcentrationMgMl * bagVolumeMl) / vialConcentrationMgMl,
  );

  if (!isPositive(medicationVolumeMl) || medicationVolumeMl >= bagVolumeMl) {
    return null;
  }

  const infusionRateMlHour = roundToTwo(infusionRateInput);
  const bagDurationHours = roundToTwo(bagVolumeMl / infusionRateInput);
  const totalTreatmentDurationHours = roundToTwo(bagDurationHours * bagCount);

  return {
    drugRequiredMgHour,
    targetBagConcentrationMgMl,
    infusionRateMlHour,
    medicationVolumeMl,
    serumVolumeToRemoveMl: medicationVolumeMl,
    bagDurationHours,
    totalTreatmentDurationHours,
    instruction:
      `Anadir ${medicationVolumeMl} ml del medicamento a la bolsa y retirar ` +
      `${medicationVolumeMl} ml de suero. Administrar a ${infusionRateMlHour} ml/h.`,
    warnings: [PROFESSIONAL_USE_WARNING, CRI_UNIT_WARNING],
  };
}

export function validateCriInput(input: CriInput): readonly CriValidationIssue[] {
  const issues: CriValidationIssue[] = [];
  const fields: readonly (keyof CriInput)[] = [
    'patientWeightKg',
    'doseRate',
    'vialConcentrationMgMl',
    'bagVolumeMl',
    'bagCount',
    'infusionRateMlHour',
  ];

  for (const field of fields) {
    const value = input[field];

    if ((typeof value !== 'number' && typeof value !== 'string') || !isPositive(toNumber(value))) {
      issues.push({ field, message: 'Este valor debe ser mayor que cero.' });
    }
  }

  return issues;
}

function convertDoseRateToMgKgHour(doseRate: number, doseRateUnit: CriDoseRateUnit): number {
  switch (doseRateUnit) {
    case 'ug/kg/min':
      return (doseRate * 60) / 1000;
    case 'ug/kg/h':
      return doseRate / 1000;
    case 'mg/kg/h':
      return doseRate;
  }
}
