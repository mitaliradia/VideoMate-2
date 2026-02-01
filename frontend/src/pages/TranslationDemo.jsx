import React, { useState } from 'react';
import { translateMessage } from '../lib/translate';
import toast from 'react-hot-toast';

const TranslationDemo = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await translateMessage(inputText, 'en');
      setTranslatedText(result.translatedText);
      toast.success('Translation successful!');
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Translation Demo</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Enter text to translate:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows="3"
            placeholder="Type something in any language..."
          />
        </div>
        
        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Translating...' : 'Translate to English'}
        </button>
        
        {translatedText && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium mb-1">Translation:</label>
            <p className="text-blue-800">{translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationDemo;