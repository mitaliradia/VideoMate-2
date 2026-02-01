import translate from 'google-translate-api-x';

export const translateText = async (text, targetLanguage) => {
    try {
        const result = await translate(text, { to: targetLanguage });
        return {
            translatedText: result.text,
            detectedLanguage: result.from.language.iso,
            originalText: text
        };
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error('Translation failed');
    }
};

export const detectLanguage = async (text) => {
    try {
        const result = await translate(text, { to: 'en' });
        return result.from.language.iso;
    } catch (error) {
        console.error('Language detection error:', error);
        throw new Error('Language detection failed');
    }
};