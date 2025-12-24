const https = require('https');
require('dotenv').config();

const apiKey = process.env.API_key || process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("No API Key"); process.exit(1); }

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Querying: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else if (json.models) {
                console.log("\n--- SUPPORTED MODELS ---");
                const supported = json.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));

                if (supported.length === 0) {
                    console.log("No models support 'generateContent'.");
                } else {
                    supported.forEach(m => {
                        // Print the full resource name (e.g. models/gemini-pro) and the short name
                        console.log(`Resource: ${m.name}`);
                        console.log(`Short Name: ${m.name.replace('models/', '')}`);
                        console.log(`Methods: ${m.supportedGenerationMethods.join(', ')}`);
                        console.log('-');
                    });
                }
            } else {
                console.log("Unexpected response structure:", Object.keys(json));
            }
        } catch (e) {
            console.error("Parse error:", e);
            console.log("Raw data preview:", data.substring(0, 200));
        }
    });
}).on('error', (e) => {
    console.error("Network error:", e);
});
