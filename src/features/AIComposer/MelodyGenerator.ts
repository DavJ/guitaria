/**
 * MelodyGenerator - AI-powered melody generation
 */

import type { MelodyNote, MelodyGenerationOptions, CompositionStyle } from './types';
import { midiToPitch } from './composerUtils';

/**
 * Scale patterns for different modes
 */
const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10]
};

/**
 * Rhythm patterns for different styles
 */
const RHYTHM_PATTERNS: Record<CompositionStyle, number[]> = {
  rock: [0.5, 0.5, 0.25, 0.25, 0.5, 1.0],
  pop: [0.25, 0.25, 0.5, 0.5, 0.25, 0.25, 1.0],
  blues: [0.33, 0.33, 0.33, 0.5, 0.5, 1.0],
  jazz: [0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 1.0],
  country: [0.5, 0.25, 0.25, 0.5, 0.5, 1.0],
  folk: [0.5, 0.5, 0.5, 0.5, 1.0],
  funk: [0.25, 0.125, 0.125, 0.25, 0.25, 0.5, 1.0],
  ballad: [1.0, 0.5, 0.5, 1.0, 2.0],
  metal: [0.25, 0.25, 0.25, 0.25, 0.125, 0.125, 0.5, 1.0]
};

/**
 * Generate a melody based on a motif and style
 */
export const generateMelody = async (
  options: MelodyGenerationOptions
): Promise<MelodyNote[]> => {
  const {
    style,
    length = 16,
    complexity = 'moderate',
    baseMotif = []
  } = options;

  const melody: MelodyNote[] = [];
  let currentTime = 0;

  // Use base motif if provided
  if (baseMotif.length > 0) {
    melody.push(...baseMotif);
    currentTime = baseMotif[baseMotif.length - 1].time + baseMotif[baseMotif.length - 1].duration;
  }

  // Get rhythm pattern for style
  const rhythmPattern = RHYTHM_PATTERNS[style] || RHYTHM_PATTERNS.rock;
  
  // Select scale based on style
  let scale = SCALES.major;
  if (style === 'blues' || style === 'rock') scale = SCALES.blues;
  else if (style === 'jazz') scale = SCALES.dorian;
  else if (style === 'folk' || style === 'country') scale = SCALES.pentatonic;

  // Base root note
  const rootMidi = 60; // Middle C

  // Generate melody notes
  const totalNotes = length;
  let rhythmIndex = 0;

  for (let i = melody.length; i < totalNotes; i++) {
    // Select note from scale
    const scaleIndex = Math.floor(Math.random() * scale.length);
    const midiNote = rootMidi + scale[scaleIndex] + (Math.floor(Math.random() * 3) - 1) * 12;
    const { pitch, octave } = midiToPitch(midiNote);

    // Select duration from rhythm pattern
    const duration = rhythmPattern[rhythmIndex % rhythmPattern.length];
    rhythmIndex++;

    // Velocity based on complexity
    let velocity = 0.7;
    if (complexity === 'simple') {
      velocity = 0.6 + Math.random() * 0.2;
    } else if (complexity === 'complex') {
      velocity = 0.5 + Math.random() * 0.5;
    }

    melody.push({
      pitch,
      octave,
      duration,
      time: currentTime,
      velocity
    });

    currentTime += duration;
  }

  return melody;
};

/**
 * Develop a motif into a full melody section
 */
export const developMotif = (
  motif: MelodyNote[],
  targetLength: number,
  style: CompositionStyle
): MelodyNote[] => {
  const developed: MelodyNote[] = [...motif];
  let currentTime = motif.length > 0 
    ? motif[motif.length - 1].time + motif[motif.length - 1].duration 
    : 0;

  while (developed.length < targetLength) {
    // Variation techniques
    const technique = Math.random();
    
    if (technique < 0.3) {
      // Repetition
      const repeatSource = motif[Math.floor(Math.random() * motif.length)];
      developed.push({
        ...repeatSource,
        time: currentTime
      });
    } else if (technique < 0.6) {
      // Sequence (transposition)
      const sourceNote = developed[Math.floor(Math.random() * developed.length)];
      const transposition = Math.random() > 0.5 ? 2 : -2;
      const midiNote = sourceNote.octave * 12 + 
        ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(sourceNote.pitch);
      const { pitch, octave } = midiToPitch(midiNote + transposition);
      
      developed.push({
        ...sourceNote,
        pitch,
        octave,
        time: currentTime
      });
    } else {
      // New melodic material
      const rhythmPattern = RHYTHM_PATTERNS[style] || RHYTHM_PATTERNS.rock;
      const duration = rhythmPattern[Math.floor(Math.random() * rhythmPattern.length)];
      const scale = SCALES.pentatonic;
      const midiNote = 60 + scale[Math.floor(Math.random() * scale.length)];
      const { pitch, octave } = midiToPitch(midiNote);
      
      developed.push({
        pitch,
        octave,
        duration,
        time: currentTime,
        velocity: 0.7
      });
    }

    currentTime += developed[developed.length - 1].duration;
  }

  return developed;
};

/**
 * Apply style transformation to existing melody
 */
export const transformMelodyStyle = (
  melody: MelodyNote[],
  newStyle: CompositionStyle
): MelodyNote[] => {
  const rhythmPattern = RHYTHM_PATTERNS[newStyle] || RHYTHM_PATTERNS.rock;
  let rhythmIndex = 0;
  
  return melody.map((note) => {
    // Adjust rhythm to match new style
    const newDuration = rhythmPattern[rhythmIndex % rhythmPattern.length];
    rhythmIndex++;
    
    // Adjust velocity for style
    let velocity = note.velocity;
    if (newStyle === 'ballad') {
      velocity = Math.min(velocity, 0.6);
    } else if (newStyle === 'metal' || newStyle === 'rock') {
      velocity = Math.max(velocity, 0.7);
    }
    
    return {
      ...note,
      duration: newDuration,
      velocity
    };
  });
};

export default {
  generateMelody,
  developMotif,
  transformMelodyStyle
};
