import { CriInput, CriResult } from '../cri/cri.models';
import { DoseInput, DoseResult } from '../dose/dose.models';

export type CalculationKind = 'dose' | 'cri';

export type HistoryEntry =
  | {
      id: string;
      kind: 'dose';
      createdAt: string;
      input: DoseInput;
      result: DoseResult;
      instruction: string;
    }
  | {
      id: string;
      kind: 'cri';
      createdAt: string;
      input: CriInput;
      result: CriResult;
      instruction: string;
    };
