import { axiosInstance } from './axios';

export const translateMessage = async (text, targetLanguage) => {
    const response = await axiosInstance.post('/translate/translate', {
        text,
        targetLanguage
    });
    return response.data;
};