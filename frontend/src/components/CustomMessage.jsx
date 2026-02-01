import React, { useState } from 'react';
import { MessageSimple, useMessageContext } from 'stream-chat-react';
import { translateMessage } from '../lib/translate';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

const CustomMessage = (props) => {
  const { message } = useMessageContext();
  const { authUser } = useAuthUser();
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Don't show translate button for own messages
  const isOwnMessage = message.user?.id === authUser?._id;

  const handleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (!message.text) return;

    setIsLoading(true);
    try {
      const result = await translateMessage(message.text, authUser?.learningLanguage || 'en');
      setTranslatedText(result.translatedText);
      setIsTranslated(true);
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="custom-message">
      <MessageSimple {...props} />
      
      {/* Translation controls - only for other people's messages */}
      {!isOwnMessage && message.text && (
        <div className="translation-controls mt-1 ml-12">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            {isLoading ? 'Translating...' : (isTranslated ? 'Show Original' : 'Translate')}
          </button>
          
          {isTranslated && translatedText && (
            <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded text-sm">
              <div className="text-xs text-blue-600 font-medium mb-1">Translation:</div>
              <div className="text-blue-800">{translatedText}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomMessage;