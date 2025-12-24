require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.API_key || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('No API key found in .env');
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

(async () => {
    try {
        console.log('Fetching available models...');
        const response = await genAI.models.list();

        // In the new SDK, response usually contains a 'models' array or similar
        // We'll print the whole structure to be sure
        if (response && response.models) {
            console.log('--- Available Models (Filtered) ---');
            const filtered = response.models.filter(m =>
                m.name.includes('1.5') ||
                m.name.includes('flash') ||
                m.name.includes('pro')
            );

            filtered.forEach(m => {
                console.log(m.name);
            });
        } else {
            console.log('Full Response:', JSON.stringify(response, null, 2));
        }

    } catch (e) {
        console.error('Error listing models:', e);
    }
})();
