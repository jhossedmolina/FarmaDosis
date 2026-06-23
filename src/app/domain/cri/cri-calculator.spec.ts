import { calculateCri, validateCriInput } from './cri-calculator';
import { CriInput } from './cri.models';

describe('cri calculator', () => {
  const baseInput: CriInput = {
    patientWeightKg: 10,
    doseRate: 0.3,
    doseRateUnit: 'mg/kg/h',
    vialConcentrationMgMl: 10,
    bagVolumeMl: 500,
    bagCount: 5,
    bagDurationHours: 10,
  };

  it('calculates CRI step results', () => {
    const result = calculateCri(baseInput);

    expect(result).toEqual(
      jasmine.objectContaining({
        drugRequiredMgHour: 3,
        targetBagConcentrationMgMl: 0.06,
        medicationVolumeMl: 3,
        serumVolumeToRemoveMl: 3,
        bagDurationHours: 10,
        totalTreatmentDurationHours: 50,
      }),
    );
  });

  it('converts ug/kg/min to mg/kg/h', () => {
    const result = calculateCri({
      ...baseInput,
      doseRate: 5,
      doseRateUnit: 'ug/kg/min',
    });

    expect(result?.drugRequiredMgHour).toBe(3);
  });

  it('accepts comma decimal strings from mobile inputs', () => {
    const result = calculateCri({
      ...baseInput,
      patientWeightKg: '10',
      doseRate: '0,3',
      vialConcentrationMgMl: '10',
      bagVolumeMl: '500',
      bagCount: '5',
      bagDurationHours: '10',
    });

    expect(result?.medicationVolumeMl).toBe(3);
  });

  it('blocks zero, negative and incomplete values', () => {
    const issues = validateCriInput({
      ...baseInput,
      bagVolumeMl: 0,
      bagDurationHours: -1,
    });

    expect(issues.map((issue) => issue.field)).toContain('bagVolumeMl');
    expect(issues.map((issue) => issue.field)).toContain('bagDurationHours');
    expect(calculateCri({ ...baseInput, vialConcentrationMgMl: 0 })).toBeNull();
  });

  it('blocks medication volume that would exceed bag volume', () => {
    const result = calculateCri({
      ...baseInput,
      doseRate: 500,
      vialConcentrationMgMl: 1,
    });

    expect(result).toBeNull();
  });
});
