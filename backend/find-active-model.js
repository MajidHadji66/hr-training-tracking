require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.API_key || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('No API key found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

(async () => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // dummy
        // accessing the API directly to list models
        // The legacy SDK doesn't expose listModels nicely on the main class in all versions, 
        // but we can try the direct fetch or just iterate common names if list fails.
        // Actually, create a manager or use the class if available.
        // Let's try the response from the previous error which suggested calling ListModels.

        // In legacy SDK:
        const fetch = require('node-fetch'); // might not be there, but let's assume standard node env or the SDK handles it
        // Actually the SDK has a listModels method usually on a ModelManager or similar.
        // Let's try to map over standard names and see which one doesn't throw 404 if possible? No that's expensive.

        // Let's use the new SDK for listing because we saw it worked in step 374/431 (even if filtered).
        // Wait, I uninstalled the new SDK.
        // I must use the legacy SDK way or just axios/fetch.

        // Simplest: Try to find the exact model name from the user's previous logs.
        // User logs showed: 
        // gemini-2.5-computer-use-preview-10-2025
        // deep-research-pro-preview-12-2025
        // ...
        // It seems standard models are MISSING from the top of the list?

        // Let's try to list using raw fetch to the API endpoint to be sure.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log("Found models supporting generateContent:");
            const candidates = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name); // returns "models/gemini-1.5-flash"

            candidates.forEach(c => console.log(c));
        } else {
            console.log("Failed to list models via raw fetch:", data);
        }

    } catch (e) {
        console.error('Error:', e);
    }
})();
