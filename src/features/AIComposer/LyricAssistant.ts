/**
 * LyricAssistant - AI-powered lyrics generation
 */

import type { LyricGenerationOptions, SectionType } from './types';

/**
 * Lyric templates for different emotions
 */
const LYRIC_TEMPLATES: Record<string, string[]> = {
  happy: [
    "Dancing in the sunshine, feeling so alive",
    "Every day's a blessing, reaching for the sky",
    "Hearts are singing, joy is in the air",
    "Life is beautiful, without a single care"
  ],
  sad: [
    "Tears are falling like the autumn rain",
    "Memories of you still cause me pain",
    "In the silence, I can hear your name",
    "Nothing feels the same, nothing feels the same"
  ],
  romantic: [
    "You're the melody that plays in my heart",
    "Together forever, never to part",
    "In your eyes, I see my destiny",
    "You and me, that's how it's meant to be"
  ],
  inspirational: [
    "Rise above the storms, reach for the light",
    "Believe in yourself, you have the might",
    "Dreams are calling, answer their call",
    "Stand up tall, never let yourself fall"
  ],
  rebellious: [
    "Breaking all the rules, living my way",
    "No one's gonna tell me what to say",
    "Freedom in my soul, fire in my heart",
    "This is just the start, this is just the start"
  ]
};

/**
 * Theme-based lyric phrases
 */
const THEME_PHRASES: Record<string, string[]> = {
  love: ["love", "heart", "soul", "embrace", "forever", "together"],
  freedom: ["freedom", "fly", "break free", "wings", "chains", "liberate"],
  nature: ["sky", "ocean", "mountain", "river", "forest", "stars"],
  journey: ["road", "path", "journey", "adventure", "explore", "wander"],
  hope: ["hope", "dream", "believe", "faith", "tomorrow", "light"]
};

/**
 * Generate lyrics based on options
 */
export const generateLyrics = async (
  options: LyricGenerationOptions
): Promise<string> => {
  const {
    theme = 'love',
    emotion = 'happy',
    lineCount = 4
  } = options;

  // For now, generate simple template-based lyrics
  // In a real implementation, this would call an AI API
  const templates = LYRIC_TEMPLATES[emotion] || LYRIC_TEMPLATES.happy;
  const themePhrases = THEME_PHRASES[theme] || THEME_PHRASES.love;

  const lyrics: string[] = [];
  
  for (let i = 0; i < lineCount; i++) {
    if (i < templates.length) {
      let line = templates[i];
      
      // Inject theme-related words
      if (Math.random() > 0.5 && themePhrases.length > 0) {
        const phrase = themePhrases[Math.floor(Math.random() * themePhrases.length)];
        // Simple word replacement
        const words = line.split(' ');
        if (words.length > 2) {
          const replaceIndex = Math.floor(Math.random() * words.length);
          words[replaceIndex] = phrase;
          line = words.join(' ');
        }
      }
      
      lyrics.push(line);
    }
  }

  return lyrics.join('\n');
};

/**
 * Generate lyrics for a specific section type
 */
export const generateSectionLyrics = async (
  sectionType: SectionType,
  options: LyricGenerationOptions
): Promise<string> => {
  const lineCountMap: Record<SectionType, number> = {
    intro: 0, // Usually instrumental
    verse: 4,
    chorus: 4,
    bridge: 2,
    solo: 0, // Usually instrumental
    outro: 2
  };

  const adjustedOptions = {
    ...options,
    lineCount: lineCountMap[sectionType]
  };

  if (adjustedOptions.lineCount === 0) {
    return ''; // Instrumental section
  }

  return generateLyrics(adjustedOptions);
};

/**
 * Refine existing lyrics based on feedback
 */
export const refineLyrics = async (
  currentLyrics: string,
  feedback: string
): Promise<string> => {
  // Simple refinement logic
  // In a real implementation, this would use AI to understand feedback
  
  const lines = currentLyrics.split('\n');
  
  if (feedback.toLowerCase().includes('shorter')) {
    return lines.slice(0, Math.floor(lines.length / 2)).join('\n');
  }
  
  if (feedback.toLowerCase().includes('longer')) {
    // Duplicate with variation
    return currentLyrics + '\n' + currentLyrics;
  }
  
  if (feedback.toLowerCase().includes('sad') || feedback.toLowerCase().includes('smutn')) {
    // Replace with sad templates
    return generateLyrics({ emotion: 'sad', lineCount: lines.length });
  }
  
  if (feedback.toLowerCase().includes('happy') || feedback.toLowerCase().includes('vesel')) {
    return generateLyrics({ emotion: 'happy', lineCount: lines.length });
  }
  
  // Default: return original with minor changes
  return lines.map(line => {
    const words = line.split(' ');
    if (words.length > 3 && Math.random() > 0.7) {
      // Swap two random words
      const i1 = Math.floor(Math.random() * words.length);
      const i2 = Math.floor(Math.random() * words.length);
      [words[i1], words[i2]] = [words[i2], words[i1]];
    }
    return words.join(' ');
  }).join('\n');
};

/**
 * Translate lyrics (simplified)
 */
export const translateLyrics = async (
  lyrics: string,
  targetLanguage: string
): Promise<string> => {
  // In a real implementation, this would use a translation API
  // For now, return original with a note
  return `[${targetLanguage.toUpperCase()}] ${lyrics}`;
};

/**
 * Generate rhyming words for a given word
 */
export const findRhymes = (word: string): string[] => {
  // Simplified rhyme detection
  // In a real implementation, use a rhyming dictionary API
  const lastTwoChars = word.slice(-2).toLowerCase();
  
  const rhymeMap: Record<string, string[]> = {
    'ay': ['day', 'way', 'play', 'say', 'stay'],
    'ow': ['now', 'how', 'vow', 'bow', 'allow'],
    'ht': ['night', 'light', 'sight', 'bright', 'flight'],
    'ee': ['free', 'see', 'tree', 'be', 'me'],
    've': ['love', 'above', 'dove', 'shove'],
  };
  
  return rhymeMap[lastTwoChars] || [];
};

export default {
  generateLyrics,
  generateSectionLyrics,
  refineLyrics,
  translateLyrics,
  findRhymes
};
