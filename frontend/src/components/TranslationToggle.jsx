import { useState } from 'react';
import { translateMessage } from '../lib/translate';
import toast from 'react-hot-toast';

const TranslationToggle = ({ message, userLanguage }) => {
    const [isTranslated, setIsTranslated] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTranslate = async () => {
        if (isTranslated) {
            setIsTranslated(false);
            return;
        }

        setIsLoading(true);
        try {
            const result = await translateMessage(message.text, userLanguage);
            setTranslatedText(result.translatedText);
            setIsTranslated(true);
        } catch (error) {
            toast.error('Translation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-1">
            <button
                onClick={handleTranslate}
                disabled={isLoading}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
                {isLoading ? '...' : (isTranslated ? 'Original' : 'Translate')}
            </button>
            {isTranslated && (
                <div className="mt-1 p-2 bg-blue-50 rounded text-sm italic">
                    {translatedText}
                </div>
            )}
        </div>
    );
};

export default TranslationToggle;