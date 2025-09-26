import { Injectable } from '@nestjs/common';

export interface PainterSelectionCriteria {
  startTime: Date;
  endTime: Date;
}

export interface PainterCandidate {
  id: string;
  availability: {
    id: string;
    startTime: Date;
    endTime: Date;
  };
}

@Injectable()
export class PainterSelectionService {
  selectPainter(candidates: PainterCandidate[]): PainterCandidate | null {
    // Simply return the first available painter (automatic assignment)
    return candidates.length > 0 ? candidates[0] : null;
  }
}


