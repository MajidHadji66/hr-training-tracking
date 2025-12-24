const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('Checking .env at:', envPath);

if (!fs.existsSync(envPath)) {
    console.log('ERROR: .env file NOT found at this path!');
} else {
    console.log('.env file exists.');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- Keys found in .env ---');
    content.split('\n').forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return; // Skip comments/empty

        const parts = trimmed.split('=');
        const key = parts[0].trim();
        const hasValue = parts.length > 1 && parts.slice(1).join('=').trim().length > 0;

        console.log(`Line ${index + 1}: Key="${key}", HasValue=${hasValue}`);

        if (key.indexOf('HEX') !== -1) {
            // Avoid printing hex artifacts if any
        }
    });
    console.log('--------------------------');
}
