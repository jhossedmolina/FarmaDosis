import { Injectable, computed, signal } from '@angular/core';

import { HistoryEntry } from '../../../domain/history/history.models';

@Injectable({ providedIn: 'root' })
export class HistoryStoreService {
  private readonly entriesSignal = signal<HistoryEntry[]>([]);

  readonly entries = this.entriesSignal.asReadonly();
  readonly hasEntries = computed(() => this.entriesSignal().length > 0);

  add(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
    const nextEntry = {
      ...entry,
      id: this.createId(),
      createdAt: new Date().toISOString(),
    } as HistoryEntry;

    this.entriesSignal.update((entries) => [nextEntry, ...entries].slice(0, 20));

    return nextEntry;
  }

  remove(id: string): boolean {
    const exists = this.entriesSignal().some((entry) => entry.id === id);

    if (!exists) {
      return false;
    }

    this.entriesSignal.update((entries) => entries.filter((entry) => entry.id !== id));

    return true;
  }

  find(id: string): HistoryEntry | undefined {
    return this.entriesSignal().find((entry) => entry.id === id);
  }

  private createId(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
