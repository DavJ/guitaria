/**
 * InputPanel - Component for capturing user input (audio, MIDI, notation)
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { InputOptions } from './types';

interface InputPanelProps {
  onInputCaptured: (options: InputOptions) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onInputCaptured }) => {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState<'audio' | 'midi' | 'notation'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setRecordedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(t('aiComposer.input.microphoneError'));
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRecordedFile(file);
    }
  };

  const handleUseInput = () => {
    if (recordedFile) {
      onInputCaptured({
        type: inputType,
        source: recordedFile
      });
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('aiComposer.input.title')}</h2>
      
      {/* Input Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {t('aiComposer.input.selectType')}
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setInputType('audio')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              inputType === 'audio'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎤 {t('aiComposer.input.audio')}
          </button>
          <button
            onClick={() => setInputType('midi')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              inputType === 'midi'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎹 {t('aiComposer.input.midi')}
          </button>
          <button
            onClick={() => setInputType('notation')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              inputType === 'notation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎼 {t('aiComposer.input.notation')}
          </button>
        </div>
      </div>

      {/* Input Capture Area */}
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
        {inputType === 'audio' && (
          <div className="text-center space-y-4">
            {!isRecording && !recordedFile && (
              <button
                onClick={handleStartRecording}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                🔴 {t('aiComposer.input.startRecording')}
              </button>
            )}
            
            {isRecording && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">
                    {t('aiComposer.input.recording')}
                  </span>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  ⏹️ {t('aiComposer.input.stopRecording')}
                </button>
              </div>
            )}
            
            {recordedFile && (
              <div className="space-y-3">
                <p className="text-green-400">✓ {t('aiComposer.input.recorded')}</p>
                <p className="text-sm text-gray-400">{recordedFile.name}</p>
              </div>
            )}
          </div>
        )}

        {(inputType === 'midi' || inputType === 'notation') && (
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={inputType === 'midi' ? '.mid,.midi' : '.xml,.musicxml'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              📁 {t('aiComposer.input.uploadFile')}
            </button>
            {recordedFile && (
              <p className="mt-3 text-sm text-gray-400">{recordedFile.name}</p>
            )}
          </div>
        )}
      </div>

      {/* Use Input Button */}
      {recordedFile && (
        <div className="mt-4">
          <button
            onClick={handleUseInput}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          >
            ✓ {t('aiComposer.input.useInput')}
          </button>
        </div>
      )}
    </div>
  );
};

export default InputPanel;
