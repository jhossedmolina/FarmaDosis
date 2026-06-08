import { calculateDose, formatTabletAmount, validateDoseInput } from './dose-calculator';
import { DoseInput } from './dose.models';

describe('dose calculator', () => {
  const baseInput: DoseInput = {
    patientWeightKg: 12.5,
    dosePerKg: 10,
    doseUnit: 'mg/kg',
    presentation: 'none',
  };

  it('calculates total dose from weight and dose per kg', () => {
    const result = calculateDose(baseInput);

    expect(result).toEqual(
      jasmine.objectContaining({
        totalDose: 125,
        totalDoseUnit: 'mg',
      }),
    );
  });

  it('calculates solution physical amount in ml', () => {
    const result = calculateDose({
      ...baseInput,
      presentation: 'solution',
      concentration: 50,
      concentrationUnit: 'mg/ml',
    });

    expect(result?.physicalAmount).toBe(2.5);
    expect(result?.physicalAmountUnit).toBe('ml');
  });

  it('formats tablet amount to readable quarters', () => {
    expect(formatTabletAmount(0.25)).toBe('1/4');
    expect(formatTabletAmount(0.5)).toBe('1/2');
    expect(formatTabletAmount(0.75)).toBe('3/4');
    expect(formatTabletAmount(1.5)).toBe('1 1/2');
  });

  it('accepts comma decimal strings from mobile inputs', () => {
    const result = calculateDose({
      patientWeightKg: '12,5',
      dosePerKg: '10',
      doseUnit: 'mg/kg',
      presentation: 'solution',
      concentration: '50',
      concentrationUnit: 'mg/ml',
    });

    expect(result?.physicalAmount).toBe(2.5);
  });

  it('blocks invalid numeric input', () => {
    const issues = validateDoseInput({
      ...baseInput,
      patientWeightKg: 0,
      dosePerKg: -1,
    });

    expect(issues.map((issue) => issue.field)).toContain('patientWeightKg');
    expect(issues.map((issue) => issue.field)).toContain('dosePerKg');
    expect(calculateDose({ ...baseInput, patientWeightKg: 0 })).toBeNull();
  });

  it('validates dose and concentration unit combinations for solutions', () => {
    const issues = validateDoseInput({
      ...baseInput,
      presentation: 'solution',
      concentration: 10,
      concentrationUnit: 'ml/ml',
    });

    expect(issues.map((issue) => issue.field)).toContain('concentrationUnit');
  });
});
