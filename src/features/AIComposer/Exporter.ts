/**
 * Exporter - Export compositions to various formats
 */

import type { Composition, ExportFormat } from './types';

/**
 * Export composition to .gtrsong format (JSON-based)
 */
export const exportToGTRSong = (composition: Composition): Blob => {
  const data = JSON.stringify(composition, null, 2);
  return new Blob([data], { type: 'application/json' });
};

/**
 * Export composition to MusicXML format
 */
export const exportToMusicXML = (composition: Composition): Blob => {
  // Simplified MusicXML generation
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${escapeXML(composition.title)}</work-title>
  </work>
  <identification>
    <creator type="composer">${escapeXML(composition.artist)}</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    ${composition.sections.map((section, idx) => `
    <!-- ${section.name} -->
    <measure number="${idx + 1}">
      <attributes>
        <divisions>1</divisions>
        <key>
          <fifths>${keyToFifths(composition.key)}</fifths>
        </key>
        <time>
          <beats>${composition.timeSignature.split('/')[0]}</beats>
          <beat-type>${composition.timeSignature.split('/')[1]}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction>
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${composition.tempo}</per-minute>
          </metronome>
        </direction-type>
      </direction>
      ${section.melody.slice(0, 4).map(note => `
      <note>
        <pitch>
          <step>${note.pitch.charAt(0)}</step>
          ${note.pitch.includes('#') ? '<alter>1</alter>' : ''}
          <octave>${note.octave}</octave>
        </pitch>
        <duration>${Math.round(note.duration * 4)}</duration>
        <type>${getDurationType(note.duration)}</type>
      </note>`).join('')}
    </measure>`).join('')}
  </part>
</score-partwise>`;

  return new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
};

/**
 * Export composition to MIDI format (simplified)
 */
export const exportToMIDI = (composition: Composition): Blob => {
  // This is a placeholder - real MIDI generation would require a MIDI library
  // For now, return a simple text representation
  const midiText = `MIDI Export: ${composition.title}
Tempo: ${composition.tempo} BPM
Key: ${composition.key}
Sections: ${composition.sections.length}

Note: MIDI export requires additional library integration.
This is a placeholder export.`;

  return new Blob([midiText], { type: 'text/plain' });
};

/**
 * Sanitize filename to remove invalid characters
 */
const sanitizeFilename = (filename: string): string => {
  // Remove invalid filename characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/[\x00-\x1F]/g, '') // eslint-disable-line no-control-regex
    .replace(/\s+/g, '_')
    .substring(0, 200); // Limit length
};

/**
 * Download a file to the user's computer
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export composition based on format
 */
export const exportComposition = async (
  composition: Composition,
  format: ExportFormat
): Promise<void> => {
  let blob: Blob;
  let filename: string;
  const safeTitle = sanitizeFilename(composition.title);

  switch (format.format) {
    case 'gtrsong':
      blob = exportToGTRSong(composition);
      filename = `${safeTitle}.gtrsong`;
      break;
    case 'musicxml':
      blob = exportToMusicXML(composition);
      filename = `${safeTitle}.musicxml`;
      break;
    case 'midi':
      blob = exportToMIDI(composition);
      filename = `${safeTitle}.mid`;
      break;
    default:
      throw new Error('Unsupported export format');
  }

  downloadFile(blob, filename);
};

/**
 * Import composition from file
 */
export const importComposition = async (file: File): Promise<Composition> => {
  const text = await file.text();
  
  try {
    // Try to parse as JSON (gtrsong format)
    const data = JSON.parse(text);
    
    // Convert date strings back to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      modifiedAt: new Date(data.modifiedAt)
    } as Composition;
  } catch {
    // If not JSON, try to parse as MusicXML
    // This is a simplified parser
    throw new Error('MusicXML import not yet implemented');
  }
};

// Helper functions

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function keyToFifths(key: string): number {
  const fifthsMap: Record<string, number> = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6,
    'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6
  };
  return fifthsMap[key] || 0;
}

function getDurationType(duration: number): string {
  if (duration >= 2) return 'whole';
  if (duration >= 1) return 'half';
  if (duration >= 0.5) return 'quarter';
  if (duration >= 0.25) return 'eighth';
  return '16th';
}

export default {
  exportComposition,
  importComposition,
  exportToGTRSong,
  exportToMusicXML,
  exportToMIDI,
  downloadFile
};
