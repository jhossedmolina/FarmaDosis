import { TestBed } from '@angular/core/testing';

import { HistoryStoreService } from './history-store.service';
import { HistoryStorageService } from '../../../infrastructure/storage/history-storage.service';

describe('HistoryStoreService', () => {
  let service: HistoryStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(HistoryStorageService).clear();
    service = TestBed.inject(HistoryStoreService);
  });

  it('starts empty', () => {
    expect(service.entries()).toEqual([]);
    expect(service.hasEntries()).toBeFalse();
  });

  it('adds and finds dose entries', () => {
    const createdEntry = service.add({
      kind: 'dose',
      input: {
        patientWeightKg: 10,
        dosePerKg: 5,
        doseUnit: 'mg/kg',
        presentation: 'none',
      },
      result: {
        totalDose: 50,
        totalDoseUnit: 'mg',
        instruction: 'Administrar 50 mg.',
        warnings: [],
      },
      instruction: 'Administrar 50 mg.',
    });

    const [entry] = service.entries();

    expect(service.hasEntries()).toBeTrue();
    expect(createdEntry).toEqual(entry);
    expect(entry.kind).toBe('dose');
    expect(service.find(entry.id)).toEqual(entry);
  });

  it('removes entries by id', () => {
    service.add({
      kind: 'dose',
      input: {
        patientWeightKg: 10,
        dosePerKg: 5,
        doseUnit: 'mg/kg',
        presentation: 'none',
      },
      result: {
        totalDose: 50,
        totalDoseUnit: 'mg',
        instruction: 'Administrar 50 mg.',
        warnings: [],
      },
      instruction: 'Administrar 50 mg.',
    });

    const [entry] = service.entries();
    const removed = service.remove(entry.id);

    expect(removed).toBeTrue();
    expect(service.entries()).toEqual([]);
  });

  it('persists entries in local storage', () => {
    const entry = service.add({
      kind: 'dose',
      input: {
        patientWeightKg: 10,
        dosePerKg: 5,
        doseUnit: 'mg/kg',
        presentation: 'none',
      },
      result: {
        totalDose: 50,
        totalDoseUnit: 'mg',
        instruction: 'Administrar 50 mg.',
        warnings: [],
      },
      instruction: 'Administrar 50 mg.',
    });

    const persistedEntries = TestBed.inject(HistoryStorageService).load();

    expect(persistedEntries).toEqual([entry]);
  });

  it('returns false when trying to remove an unknown entry', () => {
    const removed = service.remove('missing-entry');

    expect(removed).toBeFalse();
    expect(service.entries()).toEqual([]);
  });
});
