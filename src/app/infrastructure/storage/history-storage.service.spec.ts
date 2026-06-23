import { HistoryStorageService } from './history-storage.service';

describe('HistoryStorageService', () => {
  const storageKey = 'farmadosis.history.v1';

  beforeEach(() => globalThis.localStorage.clear());

  it('migrates legacy CRI records that contain an infusion rate', () => {
    globalThis.localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'legacy-cri', kind: 'cri', createdAt: '2026-01-01T00:00:00.000Z', instruction: 'Legacy',
          input: { patientWeightKg: 10, doseRate: 5, doseRateUnit: 'ug/kg/min', vialConcentrationMgMl: 40, bagVolumeMl: 100, bagCount: 2, infusionRateMlHour: 10 },
          result: {},
        },
      ]),
    );

    const entries = new HistoryStorageService().load();

    expect(entries).toHaveSize(1);
    expect((entries[0].input as { bagDurationHours?: number }).bagDurationHours).toBe(10);
    expect((entries[0].input as { infusionRateMlHour?: number }).infusionRateMlHour).toBeUndefined();
  });
});
