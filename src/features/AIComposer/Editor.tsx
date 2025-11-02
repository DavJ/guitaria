/**
 * Editor - Interactive composition editor
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Composition, CompositionSection, AICommand } from './types';
import { formatTime, transposeChord, transposeMelody } from './composerUtils';

interface EditorProps {
  composition: Composition;
  onCompositionChange: (composition: Composition) => void;
  onCommandExecute: (command: AICommand) => void;
}

const Editor: React.FC<EditorProps> = ({
  composition,
  onCompositionChange,
  onCommandExecute
}) => {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    onCompositionChange({
      ...composition,
      title: newTitle,
      modifiedAt: new Date()
    });
    setEditingTitle(false);
  };

  const handleSectionLyricsChange = (sectionId: string, newLyrics: string) => {
    const updatedSections = composition.sections.map(section =>
      section.id === sectionId
        ? { ...section, lyrics: newLyrics }
        : section
    );
    
    onCompositionChange({
      ...composition,
      sections: updatedSections,
      modifiedAt: new Date()
    });
  };

  const handleKeyChange = (newKey: string) => {
    // Calculate semitone difference
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const oldIndex = keys.indexOf(composition.key);
    const newIndex = keys.indexOf(newKey);
    const semitones = newIndex - oldIndex;

    // Transpose all sections
    const updatedSections = composition.sections.map(section => ({
      ...section,
      chords: section.chords.map(chord => transposeChord(chord, semitones)),
      melody: transposeMelody(section.melody, semitones)
    }));

    onCompositionChange({
      ...composition,
      key: newKey,
      sections: updatedSections,
      modifiedAt: new Date()
    });
  };

  const handleTempoChange = (newTempo: number) => {
    onCompositionChange({
      ...composition,
      tempo: newTempo,
      modifiedAt: new Date()
    });
  };

  const handleCommandSubmit = () => {
    if (!commandInput.trim()) return;

    // Parse command (simplified)
    const lowerCommand = commandInput.toLowerCase();
    let command: AICommand | null = null;

    if (lowerCommand.includes('tempo') || lowerCommand.includes('zrychli') || lowerCommand.includes('zpomali')) {
      const faster = lowerCommand.includes('zrychli') || lowerCommand.includes('faster');
      const newTempo = faster ? composition.tempo + 10 : composition.tempo - 10;
      command = {
        type: 'modify-tempo',
        parameters: { tempo: newTempo }
      };
    } else if (lowerCommand.includes('styl') || lowerCommand.includes('style')) {
      const styleMatch = lowerCommand.match(/(rock|pop|blues|jazz|country|folk|funk|ballad|metal)/);
      if (styleMatch) {
        command = {
          type: 'change-style',
          parameters: { style: styleMatch[1] }
        };
      }
    } else if (lowerCommand.includes('tónin') || lowerCommand.includes('key')) {
      const keyMatch = lowerCommand.match(/([A-G]#?)/);
      if (keyMatch) {
        command = {
          type: 'change-key',
          parameters: { key: keyMatch[1] }
        };
      }
    } else if (lowerCommand.includes('přidej') || lowerCommand.includes('add')) {
      command = {
        type: 'add-section',
        parameters: { type: 'bridge' }
      };
    } else if (selectedSection) {
      command = {
        type: 'modify-section',
        target: selectedSection,
        parameters: { instruction: commandInput }
      };
    }

    if (command) {
      onCommandExecute(command);
      setCommandInput('');
    }
  };

  const renderSection = (section: CompositionSection) => {
    const isSelected = selectedSection === section.id;
    
    return (
      <div
        key={section.id}
        onClick={() => setSelectedSection(section.id)}
        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-blue-500 bg-gray-700'
            : 'border-gray-600 bg-gray-750 hover:border-gray-500'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold">{section.name}</h3>
            <p className="text-sm text-gray-400">
              {formatTime(section.startTime)} - {formatTime(section.endTime)}
            </p>
          </div>
          <span className="px-3 py-1 bg-gray-600 rounded-full text-xs font-medium">
            {section.type}
          </span>
        </div>

        {/* Chords */}
        {section.chords.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-400 mb-1">{t('aiComposer.editor.chords')}:</p>
            <div className="flex flex-wrap gap-2">
              {section.chords.map((chord, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-900/50 rounded text-sm">
                  {chord.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lyrics */}
        {section.lyrics !== undefined && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">{t('aiComposer.editor.lyrics')}:</p>
            <textarea
              value={section.lyrics}
              onChange={(e) => handleSectionLyricsChange(section.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm resize-none focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder={t('aiComposer.editor.noLyrics')}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-6">
      {/* Header with title and basic controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {editingTitle ? (
            <input
              type="text"
              value={composition.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              className="text-2xl font-bold bg-gray-700 px-3 py-1 rounded border-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              className="text-2xl font-bold cursor-pointer hover:text-blue-400"
              onClick={() => setEditingTitle(true)}
            >
              {composition.title} ✏️
            </h2>
          )}
          <span className="text-sm text-gray-400">
            {t('aiComposer.editor.style')}: {composition.style}
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              {t('aiComposer.editor.key')}
            </label>
            <select
              value={composition.key}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              {t('aiComposer.editor.tempo')}
            </label>
            <input
              type="number"
              value={composition.tempo}
              onChange={(e) => handleTempoChange(parseInt(e.target.value) || 120)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              min="40"
              max="240"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              {t('aiComposer.editor.timeSignature')}
            </label>
            <input
              type="text"
              value={composition.timeSignature}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t('aiComposer.editor.sections')}</h3>
        {composition.sections.map(section => renderSection(section))}
        
        {composition.sections.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            {t('aiComposer.editor.noSections')}
          </p>
        )}
      </div>

      {/* AI Command Input */}
      <div className="border-t border-gray-700 pt-4">
        <label className="block text-sm font-medium mb-2">
          {t('aiComposer.editor.aiCommand')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCommandSubmit()}
            placeholder={t('aiComposer.editor.commandPlaceholder')}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCommandSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors"
          >
            {t('aiComposer.editor.execute')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {t('aiComposer.editor.commandExamples')}
        </p>
      </div>
    </div>
  );
};

export default Editor;
