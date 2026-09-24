import type { LyricGenerationOptions, MelodyGenerationOptions, MelodyNote, SectionType } from './types';

export interface MelodyRequest extends MelodyGenerationOptions {}

export interface LyricRequest {
  sectionType: SectionType;
  options: LyricGenerationOptions;
}

export interface ComposerProvider {
  generateMelody(request: MelodyRequest): Promise<MelodyNote[]>;
  generateSectionLyrics(sectionType: SectionType, options: LyricGenerationOptions): Promise<string>;
  refineLyrics(currentLyrics: string, instruction: string): Promise<string>;
}
