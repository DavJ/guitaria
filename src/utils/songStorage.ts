/**
 * songStorage - LocalStorage utilities for saving and loading songs
 */

import type { Song } from '../types/Song';

const STORAGE_KEY = 'guitaria_songs';

/**
 * Save a song to localStorage
 */
export function saveSong(song: Song): void {
  try {
    const songs = loadSongs();
    
    // Generate ID if not present
    const songWithId = {
      ...song,
      id: song.id || `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Check if song with same ID exists and update it
    const existingIndex = songs.findIndex(s => s.id === songWithId.id);
    
    if (existingIndex >= 0) {
      songs[existingIndex] = songWithId;
    } else {
      songs.push(songWithId);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  } catch (error) {
    console.error('Failed to save song:', error);
    throw new Error('Failed to save song to storage');
  }
}

/**
 * Load all songs from localStorage
 */
export function loadSongs(): Song[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      return [];
    }
    
    const songs = JSON.parse(data);
    
    // Validate that it's an array
    if (!Array.isArray(songs)) {
      console.warn('Invalid songs data in localStorage');
      return [];
    }
    
    return songs;
  } catch (error) {
    console.error('Failed to load songs:', error);
    return [];
  }
}

/**
 * Delete a song by title
 */
export function deleteSong(title: string): void {
  try {
    const songs = loadSongs();
    const filteredSongs = songs.filter(s => s.title !== title);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSongs));
  } catch (error) {
    console.error('Failed to delete song:', error);
    throw new Error('Failed to delete song from storage');
  }
}

/**
 * Get a specific song by title
 */
export function getSong(title: string): Song | null {
  const songs = loadSongs();
  return songs.find(s => s.title === title) || null;
}

/**
 * Clear all songs from storage
 */
export function clearAllSongs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear songs:', error);
    throw new Error('Failed to clear songs from storage');
  }
}

/**
 * Export songs as JSON file
 */
export function exportSongsToFile(): void {
  try {
    const songs = loadSongs();
    const json = JSON.stringify(songs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guitaria_songs_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export songs:', error);
    throw new Error('Failed to export songs');
  }
}

/**
 * Import songs from JSON file
 */
export async function importSongsFromFile(file: File): Promise<Song[]> {
  try {
    const text = await file.text();
    const importedSongs = JSON.parse(text);
    
    if (!Array.isArray(importedSongs)) {
      throw new Error('Invalid file format');
    }
    
    // Validate each song has required properties
    importedSongs.forEach((song, index) => {
      if (!song.title || typeof song.title !== 'string') {
        throw new Error(`Song at index ${index}: title is required and must be a string`);
      }
      if (!song.tempo || typeof song.tempo !== 'number') {
        throw new Error(`Song at index ${index}: tempo is required and must be a number`);
      }
      if (!song.key || typeof song.key !== 'string') {
        throw new Error(`Song at index ${index}: key is required and must be a string`);
      }
      if (!Array.isArray(song.sections)) {
        throw new Error(`Song at index ${index}: sections must be an array`);
      }
      
      // Validate sections
      song.sections.forEach((section: unknown, sectionIndex: number) => {
        const sec = section as Record<string, unknown>;
        if (!sec.name || typeof sec.name !== 'string') {
          throw new Error(`Song at index ${index}, section ${sectionIndex}: name is required and must be a string`);
        }
        if (!Array.isArray(sec.chords)) {
          throw new Error(`Song at index ${index}, section ${sectionIndex}: chords must be an array`);
        }
        if (sec.lyrics !== undefined && typeof sec.lyrics !== 'string') {
          throw new Error(`Song at index ${index}, section ${sectionIndex}: lyrics must be a string if provided`);
        }
      });
    });
    
    // Merge with existing songs
    const existingSongs = loadSongs();
    const mergedSongs = [...existingSongs];
    
    importedSongs.forEach(importedSong => {
      const existingIndex = mergedSongs.findIndex(s => s.id === importedSong.id);
      if (existingIndex >= 0) {
        mergedSongs[existingIndex] = importedSong;
      } else {
        mergedSongs.push(importedSong);
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSongs));
    
    return importedSongs;
  } catch (error) {
    console.error('Failed to import songs:', error);
    throw new Error('Failed to import songs from file');
  }
}

export default {
  saveSong,
  loadSongs,
  deleteSong,
  getSong,
  clearAllSongs,
  exportSongsToFile,
  importSongsFromFile,
};
