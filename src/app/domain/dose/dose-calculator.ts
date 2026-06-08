import { PROFESSIONAL_USE_WARNING } from '../safety/safety-copy';
import { DoseInput, DoseResult, DoseValidationIssue } from './dose.models';

const TABLET_ROUNDING_WARNING =
  'El redondeo de comprimidos debe validarse con criterio clinico antes de administrar.';

export function calculateDose(input: DoseInput): DoseResult | null {
  if (validateDoseInput(input).length > 0) {
    return null;
  }

  const patientWeightKg = toNumber(input.patientWeightKg);
  const dosePerKg = toNumber(input.dosePerKg);
  const concentration = toNumber(input.concentration ?? 0);
  const totalDose = roundToTwo(patientWeightKg * dosePerKg);
  const totalDoseUnit = input.doseUnit === 'mg/kg' ? 'mg' : 'ml';

  if (input.presentation === 'none') {
    return {
      totalDose,
      totalDoseUnit,
      instruction: `Administrar ${formatDecimal(totalDose)} ${totalDoseUnit} del medicamento al paciente.`,
      warnings: [PROFESSIONAL_USE_WARNING],
    };
  }

  if (!isPositive(concentration)) {
    return null;
  }

  if (input.presentation === 'solution') {
    const physicalAmount = roundToTwo(totalDose / concentration);

    return {
      totalDose,
      totalDoseUnit,
      physicalAmount,
      physicalAmountUnit: 'ml',
      displayAmount: `${formatDecimal(physicalAmount)} ml`,
      instruction: `Administrar ${formatDecimal(physicalAmount)} ml del medicamento al paciente.`,
      warnings: [PROFESSIONAL_USE_WARNING],
    };
  }

  const tablets = roundToTwo(totalDose / concentration);
  const displayAmount = formatTabletAmount(tablets);

  return {
    totalDose,
    totalDoseUnit,
    physicalAmount: tablets,
    physicalAmountUnit: 'tablet',
    displayAmount,
    instruction: `Administrar ${displayAmount} comprimido(s) al paciente.`,
    warnings: [PROFESSIONAL_USE_WARNING, TABLET_ROUNDING_WARNING],
  };
}

export function validateDoseInput(input: DoseInput): readonly DoseValidationIssue[] {
  const issues: DoseValidationIssue[] = [];

  if (!isPositive(toNumber(input.patientWeightKg))) {
    issues.push({ field: 'patientWeightKg', message: 'El peso debe ser mayor que cero.' });
  }

  if (!isPositive(toNumber(input.dosePerKg))) {
    issues.push({ field: 'dosePerKg', message: 'La dosis debe ser mayor que cero.' });
  }

  if (input.presentation !== 'none' && !isPositive(toNumber(input.concentration ?? 0))) {
    issues.push({
      field: 'concentration',
      message: 'La concentracion es obligatoria y debe ser mayor que cero.',
    });
  }

  if (
    input.presentation === 'solution' &&
    input.doseUnit === 'mg/kg' &&
    input.concentrationUnit !== 'mg/ml'
  ) {
    issues.push({
      field: 'concentrationUnit',
      message: 'Para dosis en mg/kg, la solucion debe usar concentracion mg/ml.',
    });
  }

  if (
    input.presentation === 'solution' &&
    input.doseUnit === 'ml/kg' &&
    input.concentrationUnit !== 'ml/ml'
  ) {
    issues.push({
      field: 'concentrationUnit',
      message: 'Para dosis en ml/kg, la solucion debe usar concentracion ml/ml.',
    });
  }

  if (input.presentation === 'tablet' && input.concentrationUnit !== 'mg/tablet') {
    issues.push({
      field: 'concentrationUnit',
      message: 'Los comprimidos deben indicar concentracion en mg/comprimido.',
    });
  }

  return issues;
}

export function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function toNumber(value: number | string): number {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value.replace(',', '.'));
}

export function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatDecimal(value: number): string {
  return roundToTwo(value).toString();
}

export function formatTabletAmount(value: number): string {
  const whole = Math.floor(value);
  const fraction = value - whole;
  const quarters = Math.round(fraction * 4);

  if (quarters === 0) {
    return String(whole);
  }

  if (quarters === 4) {
    return String(whole + 1);
  }

  const fractionText = quarters === 1 ? '1/4' : quarters === 2 ? '1/2' : '3/4';

  return whole > 0 ? `${whole} ${fractionText}` : fractionText;
}
