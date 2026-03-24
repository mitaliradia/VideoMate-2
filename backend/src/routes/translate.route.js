import express from 'express';
import { translateText } from '../lib/translate.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/translate', protectRoute, async (req, res) => {
    try {
        const { text, targetLanguage, messageId } = req.body;
        
        if (!text || !targetLanguage) {
            return res.status(400).json({ message: 'Text and target language are required' });
        }

        const result = await translateText(text, targetLanguage, messageId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ message: 'Translation failed' });
    }
});

export default router;