require('dotenv').config();
const pkg = require('@google/genai');

console.log('Use of @google/genai package:');
console.log('Exports:', Object.keys(pkg));

try {
    const { GoogleGenAI } = pkg;
    console.log('GoogleGenAI class:', GoogleGenAI);

    if (!GoogleGenAI) {
        console.error('ERROR: GoogleGenAI is undefined in simple import.');
    } else {
        const genAI = new GoogleGenAI('DUMMY_KEY');
        console.log('Initialized successfully:', genAI);
    }
} catch (e) {
    console.error('Initialization failed:', e);
}
