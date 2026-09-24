import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import { parseMusicXml } from '../../musicxml/parser';

const SongImport: React.FC = () => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { setCurrentSong, resetScore } = useAppStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const xmlText = await file.text();
      const song = parseMusicXml(xmlText);
      setCurrentSong(song);
      resetScore(song.notes.filter((note) => !note.isRest).length);
      setMessage({ type: 'success', text: `${t('import.success')}: ${song.title}` });
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: t('import.error') });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('import.title')}</h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xml,.musicxml"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />

          <label
            htmlFor="file-upload"
            className={`cursor-pointer inline-block px-6 py-3 rounded-lg font-semibold transition-colors ${
              isProcessing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? t('import.parsing') : t('import.uploadMusicXML')}
          </label>

          <p className="mt-4 text-sm text-gray-400">{t('import.selectFile')} (MusicXML)</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-700' : 'bg-red-700'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongImport;
