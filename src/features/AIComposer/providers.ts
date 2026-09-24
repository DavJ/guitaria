import type { ComposerProvider, LyricRequest, MelodyRequest } from './providerTypes';
import type { MelodyNote } from './types';
import { generateMelody } from './MelodyGenerator';
import { generateSectionLyrics, refineLyrics } from './LyricAssistant';

export class LocalComposerProvider implements ComposerProvider {
  async generateMelody(request: MelodyRequest): Promise<MelodyNote[]> {
    return generateMelody(request);
  }

  async generateSectionLyrics(sectionType: LyricRequest['sectionType'], request: LyricRequest['options']): Promise<string> {
    return generateSectionLyrics(sectionType, request);
  }

  async refineLyrics(currentLyrics: string, instruction: string): Promise<string> {
    return refineLyrics(currentLyrics, instruction);
  }
}
