import { Injectable } from '@angular/core';

import { HistoryEntry } from '../../domain/history/history.models';

const HISTORY_STORAGE_KEY = 'farmadosis.history.v1';

@Injectable({ providedIn: 'root' })
export class HistoryStorageService {
  load(): HistoryEntry[] {
    try {
      const serializedEntries = globalThis.localStorage?.getItem(HISTORY_STORAGE_KEY);

      if (!serializedEntries) {
        return [];
      }

      const parsedEntries: unknown = JSON.parse(serializedEntries);

      if (!Array.isArray(parsedEntries)) {
        return [];
      }

      const entries = parsedEntries.map(migrateHistoryEntry).filter(isHistoryEntry).slice(0, 20);
      // Rewrite only when a legacy CRI record was normalized, keeping the same key for users.
      if (entries.some((entry, index) => entry !== parsedEntries[index])) {
        this.save(entries);
      }
      return entries;
    } catch {
      return [];
    }
  }

  save(entries: readonly HistoryEntry[]): void {
    globalThis.localStorage?.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  }

  clear(): void {
    globalThis.localStorage?.removeItem(HISTORY_STORAGE_KEY);
  }
}

function migrateHistoryEntry(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const entry = value as { kind?: unknown; input?: Record<string, unknown> };
  if (entry.kind !== 'cri' || !entry.input || 'bagDurationHours' in entry.input) {
    return value;
  }

  const bagVolumeMl = Number(entry.input['bagVolumeMl']);
  const infusionRateMlHour = Number(entry.input['infusionRateMlHour']);
  if (!Number.isFinite(bagVolumeMl) || !Number.isFinite(infusionRateMlHour) || infusionRateMlHour <= 0) {
    return value;
  }

  const { infusionRateMlHour: _legacyRate, ...input } = entry.input;
  return { ...entry, input: { ...input, bagDurationHours: bagVolumeMl / infusionRateMlHour } };
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<HistoryEntry>;

  return (
    typeof entry.id === 'string' &&
    (entry.kind === 'dose' || entry.kind === 'cri') &&
    typeof entry.createdAt === 'string' &&
    typeof entry.instruction === 'string' &&
    typeof entry.input === 'object' &&
    entry.input !== null &&
    typeof entry.result === 'object' &&
    entry.result !== null
  );
}
