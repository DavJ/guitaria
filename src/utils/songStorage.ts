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
    
    // Check if song with same title exists and update it
    const existingIndex = songs.findIndex(s => s.title === song.title);
    
    if (existingIndex >= 0) {
      songs[existingIndex] = song;
    } else {
      songs.push(song);
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
    importedSongs.forEach(song => {
      if (!song.title || !song.tempo || !song.key || !Array.isArray(song.sections)) {
        throw new Error('Invalid song format');
      }
    });
    
    // Merge with existing songs
    const existingSongs = loadSongs();
    const mergedSongs = [...existingSongs];
    
    importedSongs.forEach(importedSong => {
      const existingIndex = mergedSongs.findIndex(s => s.title === importedSong.title);
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
