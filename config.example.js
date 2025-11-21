// API Configuration Template
// Copy this file to config.js and add your actual RapidAPI credentials
// Get your API key from: https://rapidapi.com/apiheya/api/expedia13

const CONFIG = {
    apiKey: 'YOUR_RAPIDAPI_KEY_HERE',
    apiHost: 'expedia13.p.rapidapi.com',
    useProxy: true,  // Set to true to use backend proxy (recommended - solves CORS issues)
    proxyUrl: 'http://localhost:5000/api/search-location'  // Backend proxy URL
};

// Instructions:
// 1. Sign up/login to RapidAPI: https://rapidapi.com
// 2. Subscribe to the Expedia13 API: https://rapidapi.com/apiheya/api/expedia13
// 3. Copy your X-RapidAPI-Key from the API dashboard
// 4. Replace 'YOUR_RAPIDAPI_KEY_HERE' above with your actual key
// 5. Never commit config.js with your real API key to public repositories
// 6. For deployment, set useProxy based on your deployment strategy

