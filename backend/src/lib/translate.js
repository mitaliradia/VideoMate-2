import translate from 'google-translate-api-x';
import crypto from 'crypto';

const translationCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_ITEMS = 1000;

const buildTranslationCacheKey = (text, targetLanguage, messageId) => {
    if (messageId) {
        return `message:${messageId}:${targetLanguage}`;
    }

    const textHash = crypto.createHash('sha256').update(text).digest('hex');
    return `text:${textHash}:${targetLanguage}`;
};

const getCachedTranslation = (cacheKey) => {
    const cachedEntry = translationCache.get(cacheKey);

    if (!cachedEntry) {
        return null;
    }

    const isExpired = Date.now() - cachedEntry.cachedAt > CACHE_TTL_MS;

    if (isExpired) {
        translationCache.delete(cacheKey);
        return null;
    }

    return cachedEntry.value;
};

const setCachedTranslation = (cacheKey, value) => {
    if (translationCache.size >= MAX_CACHE_ITEMS) {
        const oldestKey = translationCache.keys().next().value;
        if (oldestKey) {
            translationCache.delete(oldestKey);
        }
    }

    translationCache.set(cacheKey, {
        value,
        cachedAt: Date.now(),
    });
};

export const translateText = async (text, targetLanguage, messageId) => {
    try {
        const cacheKey = buildTranslationCacheKey(text, targetLanguage, messageId);
        const cachedResult = getCachedTranslation(cacheKey);

        if (cachedResult) {
            return cachedResult;
        }

        const result = await translate(text, { to: targetLanguage });
        const response = {
            translatedText: result.text,
            detectedLanguage: result.from.language.iso,
            originalText: text
        };

        setCachedTranslation(cacheKey, response);

        return response;
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