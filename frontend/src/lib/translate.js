import { axiosInstance } from './axios';

const translationCache = new Map();

const buildTranslationKey = (text, targetLanguage, messageId) => {
    const identity = messageId || text;
    return `${identity}:${targetLanguage}`;
};

export const translateMessage = async (text, targetLanguage, messageId) => {
    const cacheKey = buildTranslationKey(text, targetLanguage, messageId);
    const cachedResult = translationCache.get(cacheKey);

    if (cachedResult) {
        return cachedResult;
    }

    const response = await axiosInstance.post('/translate/translate', {
        text,
        targetLanguage,
        messageId,
    });

    translationCache.set(cacheKey, response.data);

    return response.data;
};