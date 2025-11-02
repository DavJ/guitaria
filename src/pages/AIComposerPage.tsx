/**
 * AIComposerPage - Main page for AI Composer feature
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputPanel from '../features/AIComposer/InputPanel';
import Editor from '../features/AIComposer/Editor';
import PreviewPlayer from '../features/AIComposer/PreviewPlayer';
import { LessonPlayer } from '../features/LessonMode';
import type {
  Composition,
  CompositionSection,
  AICommand,
  CompositionStyle
} from '../features/AIComposer/types';
import type { Song } from '../types/Song';
import { createEmptyComposition, generateId } from '../features/AIComposer/composerUtils';
import { generateMelody, transformMelodyStyle } from '../features/AIComposer/MelodyGenerator';
import { generateSectionLyrics, refineLyrics } from '../features/AIComposer/LyricAssistant';
import { exportComposition } from '../features/AIComposer/Exporter';
import { compositionToSong } from '../utils/conversionUtils';
import { saveSong } from '../utils/songStorage';

const AIComposerPage: React.FC = () => {
  const { t } = useTranslation();
  const [composition, setComposition] = useState<Composition>(createEmptyComposition());
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'edit' | 'preview'>('input');
  const [lessonSong, setLessonSong] = useState<Song | null>(null);

  const handleInputCaptured = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate initial sections based on input
      const newSections: CompositionSection[] = [
        {
          id: generateId(),
          type: 'intro',
          name: t('aiComposer.sections.intro'),
          startTime: 0,
          endTime: 8,
          chords: [
            { name: 'C', root: 'C', quality: '', duration: 2, time: 0 },
            { name: 'Am', root: 'A', quality: 'm', duration: 2, time: 2 },
            { name: 'F', root: 'F', quality: '', duration: 2, time: 4 },
            { name: 'G', root: 'G', quality: '', duration: 2, time: 6 }
          ],
          melody: await generateMelody({
            style: composition.style,
            length: 16,
            complexity: 'moderate'
          }),
          lyrics: ''
        },
        {
          id: generateId(),
          type: 'verse',
          name: t('aiComposer.sections.verse') + ' 1',
          startTime: 8,
          endTime: 24,
          chords: [
            { name: 'C', root: 'C', quality: '', duration: 2, time: 8 },
            { name: 'G', root: 'G', quality: '', duration: 2, time: 10 },
            { name: 'Am', root: 'A', quality: 'm', duration: 2, time: 12 },
            { name: 'F', root: 'F', quality: '', duration: 2, time: 14 }
          ],
          melody: await generateMelody({
            style: composition.style,
            length: 32,
            complexity: 'moderate'
          }),
          lyrics: await generateSectionLyrics('verse', {
            theme: 'love',
            emotion: 'happy',
            language: 'en'
          })
        },
        {
          id: generateId(),
          type: 'chorus',
          name: t('aiComposer.sections.chorus'),
          startTime: 24,
          endTime: 36,
          chords: [
            { name: 'F', root: 'F', quality: '', duration: 2, time: 24 },
            { name: 'C', root: 'C', quality: '', duration: 2, time: 26 },
            { name: 'G', root: 'G', quality: '', duration: 2, time: 28 },
            { name: 'Am', root: 'A', quality: 'm', duration: 2, time: 30 }
          ],
          melody: await generateMelody({
            style: composition.style,
            length: 24,
            complexity: 'moderate'
          }),
          lyrics: await generateSectionLyrics('chorus', {
            theme: 'love',
            emotion: 'happy',
            language: 'en'
          })
        }
      ];

      setComposition({
        ...composition,
        sections: newSections,
        modifiedAt: new Date()
      });
      
      setActiveTab('edit');
    } catch (error) {
      console.error('Error generating composition:', error);
      alert(t('aiComposer.errors.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommandExecute = async (command: AICommand) => {
    setIsGenerating(true);
    
    try {
      const updatedComposition = { ...composition };

      switch (command.type) {
        case 'modify-tempo': {
          updatedComposition.tempo = command.parameters.tempo as number;
          break;
        }

        case 'change-style': {
          const newStyle = command.parameters.style as CompositionStyle;
          updatedComposition.style = newStyle;
          // Transform all melodies to new style
          updatedComposition.sections = updatedComposition.sections.map(section => ({
            ...section,
            melody: transformMelodyStyle(section.melody, newStyle)
          }));
          break;
        }

        case 'change-key': {
          // Key change is handled by Editor component
          break;
        }

        case 'add-section': {
          const newSection: CompositionSection = {
            id: generateId(),
            type: 'bridge',
            name: t('aiComposer.sections.bridge'),
            startTime: updatedComposition.sections.length > 0
              ? Math.max(...updatedComposition.sections.map(s => s.endTime))
              : 0,
            endTime: 0,
            chords: [],
            melody: await generateMelody({
              style: updatedComposition.style,
              length: 16,
              complexity: 'moderate'
            }),
            lyrics: await generateSectionLyrics('bridge', {
              emotion: 'inspirational',
              language: 'en'
            })
          };
          newSection.endTime = newSection.startTime + 12;
          updatedComposition.sections.push(newSection);
          break;
        }

        case 'modify-section': {
          if (command.target) {
            const instruction = command.parameters.instruction as string;
            updatedComposition.sections = await Promise.all(
              updatedComposition.sections.map(async section => {
                if (section.id === command.target && section.lyrics) {
                  return {
                    ...section,
                    lyrics: await refineLyrics(section.lyrics, instruction)
                  };
                }
                return section;
              })
            );
          }
          break;
        }
      }

      updatedComposition.modifiedAt = new Date();
      setComposition(updatedComposition);
    } catch (error) {
      console.error('Error executing command:', error);
      alert(t('aiComposer.errors.commandFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'gtrsong' | 'musicxml' | 'midi') => {
    try {
      await exportComposition(composition, { format });
    } catch (error) {
      console.error('Export error:', error);
      alert(t('aiComposer.errors.exportFailed'));
    }
  };

  const handleStartLesson = () => {
    try {
      const song = compositionToSong(composition);
      saveSong(song);
      setLessonSong(song);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      alert('Failed to start lesson');
    }
  };

  const handleBackFromLesson = () => {
    setLessonSong(null);
  };

  // If in lesson mode, show the lesson player
  if (lessonSong) {
    return <LessonPlayer song={lessonSong} onBack={handleBackFromLesson} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('aiComposer.title')}
          </h1>
          <p className="text-gray-400">
            {t('aiComposer.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'input'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📥 {t('aiComposer.tabs.input')}
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            disabled={composition.sections.length === 0}
          >
            ✏️ {t('aiComposer.tabs.edit')}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            disabled={composition.sections.length === 0}
          >
            ▶️ {t('aiComposer.tabs.preview')}
          </button>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">{t('aiComposer.generating')}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'input' && (
            <InputPanel onInputCaptured={handleInputCaptured} />
          )}

          {activeTab === 'edit' && (
            <>
              <Editor
                composition={composition}
                onCompositionChange={setComposition}
                onCommandExecute={handleCommandExecute}
              />
              
              {/* Export Options */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">{t('aiComposer.export.title')}</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleExport('gtrsong')}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    💾 .gtrsong
                  </button>
                  <button
                    onClick={() => handleExport('musicxml')}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    🎼 MusicXML
                  </button>
                  <button
                    onClick={() => handleExport('midi')}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    🎹 MIDI
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <>
              <PreviewPlayer composition={composition} />
              
              {/* Start Lesson Button */}
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-3">
                  🎸 {t('lesson.title')}
                </h3>
                <p className="text-gray-400 mb-4">
                  Practice your composition with interactive chord display and playback
                </p>
                <button
                  onClick={handleStartLesson}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                  🎓 Start Interactive Lesson
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIComposerPage;
