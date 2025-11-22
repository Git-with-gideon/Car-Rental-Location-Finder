# Car Rental Location Finder

A modern web application for searching car rental locations worldwide using the Expedia13 API. This application provides an intuitive interface to find airports, cities, and neighborhoods where car rental services are available.

> **📋 Rubric Checklist**: See [RUBRIC_CHECKLIST.md](RUBRIC_CHECKLIST.md) to verify all assignment requirements are met.

## 🚀 Features

- **Location Search**: Search for car rental locations by city, airport, or neighborhood name
- **Smart Filtering**: Filter results by type (Airport, City, Neighborhood)
- **Advanced Sorting**: Sort results by relevance, name, or country
- **In-Result Search**: Search within results for quick filtering
- **Settings Menu**: Users can input and save their API key directly in the app (stored in browser)
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, human-friendly interface with red rose color theme

## 📋 Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- A RapidAPI account (free tier available)
- Internet connection

## 🛠️ Setup Instructions

### Step 1: Get Your API Key

1. Visit [RapidAPI](https://rapidapi.com) and create an account (or log in)
2. Navigate to the [Expedia13 API page](https://rapidapi.com/apiheya/api/expedia13)
3. Click "Subscribe to Test" to subscribe to the free tier
4. Copy your `X-RapidAPI-Key` from the API dashboard

### Step 2: Configure the Application

**Option A: Using Settings Menu (Recommended)**
1. Open `index.html` in your browser
2. Click the settings icon (⚙️) in the top right corner
3. Enter your RapidAPI key in the settings modal
4. Click "Save API Key"
5. Your key is now saved and ready to use!

**Option B: Using config.js (Alternative)**
1. Open the `config.js` file
2. Replace `YOUR_RAPIDAPI_KEY_HERE` with your actual RapidAPI key:
   ```javascript
   const CONFIG = {
       apiKey: 'your-actual-api-key-here',
       apiHost: 'expedia13.p.rapidapi.com',
       useProxy: false // chane to true if using backend (server.py)
   };
   ```

### Step 3: Run the Application

1. Open `index.html` in your web browser
   - You can double-click the file, or
   - Use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     ```
2. Navigate to `http://localhost:8000` (or the port your server uses)
3. Configure your API key using the settings menu (⚙️ icon)
4. Start searching for locations!

**Note**: The application uses direct API calls. If you encounter CORS issues, you can use the optional backend proxy (see `server.py` and `requirements.txt`).

## 📖 How to Use

1. **Configure API Key** (First Time):
   - Click the settings icon (⚙️) in the top right corner
   - Enter your RapidAPI key in the settings modal
   - Click "Save API Key" - it will be stored in your browser
   - Your key will be remembered for future visits

2. **Search for Locations**: 
   - Enter a city, airport code, or location name in the search box
   - Examples: "Kigali", "New York", "LAX", "London"
   - Press Enter or click the Search button

3. **Filter Results**:
   - Use the "Filter by Type" dropdown to show only Airports, Cities, or Neighborhoods
   - Use the "Sort by" dropdown to organize results
   - Use the search box to filter results by name

4. **View Details**:
   - Each result card shows:
     - Location name and type
     - Country information
     - Airport codes (if applicable)
     - Geographic coordinates
     - Location ID

## 🔧 API Information

### API Used
- **Name**: Expedia13 API
- **Provider**: RapidAPI (apiheya)
- **Endpoint**: `GET /api/v1/car/search-location`
- **Base URL**: `https://expedia13.p.rapidapi.com`
- **Documentation**: [Expedia13 API Documentation](https://rapidapi.com/apiheya/api/expedia13)
- **API Playground**: [Test the API](https://rapidapi.com/apiheya/api/expedia13/playground)

### API Response Structure
The API returns location data in the following format:
```json
{
  "status": true,
  "message": "Success",
  "timestamp": 1763757833765,
  "data": [
    {
      "@type": "gaiaRegionResult",
      "type": "AIRPORT|CITY|NEIGHBORHOOD",
      "regionNames": {
        "fullName": "...",
        "displayName": "...",
        "primaryDisplayName": "..."
      },
      "coordinates": {
        "lat": "...",
        "long": "..."
      },
      "hierarchyInfo": {
        "country": {
          "name": "...",
          "isoCode2": "..."
        }
      }
    }
  ]
}
```

## 🏗️ Project Structure

```
PLAYING WITH API/
├── index.html              # Main HTML file - Frontend interface
├── styles.css              # Styling and layout - Modern UI with red rose theme
├── scripts.js              # Application logic and API integration
├── config.js               # API configuration (not committed to git)
├── config.example.js       # Configuration template (safe to commit)
├── server.py               # Backend proxy server (optional - solves CORS if needed)
├── requirements.txt        # Python dependencies for proxy server (if using backend)
├── .gitignore              # Git ignore rules (excludes config.js and sensitive files)
├── README.md               # Comprehensive documentation
├── DEPLOYMENT_SIMPLE.md    # Deployment guide (static files only)
├── RUBRIC_CHECKLIST.md     # Assignment rubric checklist
└── SUBMISSION_GUIDE.md     # Pre-submission checklist and instructions
```

## 🔒 Security Notes

- **Never commit your API key** to version control
- The `config.js` file is included in `.gitignore` to prevent accidental commits
- Always use environment variables or secure configuration files in production
- Keep your API keys private and rotate them if exposed

## 🐛 Error Handling

The application handles various error scenarios:

- **Network Errors**: Displays user-friendly messages when the internet connection fails
- **API Errors**: Handles authentication failures, rate limits, and API downtime
- **Empty Results**: Provides helpful feedback when no locations are found
- **Invalid Input**: Validates user input before making API requests

## 🎨 Design Philosophy

- **Modern & Clean**: Simple, uncluttered interface
- **Human-Friendly**: Intuitive navigation and clear feedback
- **Color Scheme**: Red rose (#C41E3A) as the primary accent color
- **Responsive**: Works on all screen sizes
- **Accessible**: Clear labels and semantic HTML

## 🚧 Future Enhancements

- Integration with additional Expedia13 API endpoints (car rental availability, pricing)
- Map visualization of search results
- Save favorite locations
- Export results to CSV/JSON
- Advanced filtering options (by country, coordinates range)

## 📝 Development Challenges & Solutions

### Challenge 1: API Endpoint Discovery
**Problem**: Initial endpoint path `/search-car-rental-location` returned 404 errors.

**Solution**: Used RapidAPI playground to identify the correct endpoint path `/api/v1/car/search-location` by inspecting the actual HTTP requests made by the playground interface.

### Challenge 2: CORS (Cross-Origin Resource Sharing) Issues
**Problem**: Direct API calls from the browser were blocked by CORS policy.

**Solution**: RapidAPI APIs allow CORS, so direct calls work. An optional Python Flask backend proxy server is provided for cases where CORS might be an issue.

### Challenge 3: API Response Structure
**Problem**: The API returns nested data structures that needed careful parsing.

**Solution**: Created helper functions to safely extract data with fallback values, ensuring the UI never breaks even if some fields are missing. Used optional chaining and default values throughout.

### Challenge 4: Real-time Filtering
**Problem**: Implementing smooth filtering and sorting without page reloads.

**Solution**: Used JavaScript array methods (filter, sort) to manipulate results in memory, providing instant feedback to users. Maintained separate arrays for all results and filtered results for efficient updates.

### Challenge 5: Error Handling
**Problem**: Different API errors require different user messages.

**Solution**: Created a centralized error handling function that maps error types (network, authentication, rate limits, etc.) to user-friendly messages, improving the user experience.

### Challenge 6: User API Key Management
**Problem**: Users needed to edit config.js file to use the application, which is not user-friendly.

**Solution**: Implemented a settings menu with localStorage integration, allowing users to input and save their API key directly in the browser. The key persists across sessions and is stored securely in the browser's local storage.

## 📄 License

This project is created for educational purposes as part of the "Playing Around with APIs" assignment.

## 🙏 Credits & Attribution

### API Attribution
- **Expedia13 API**: Provided by [apiheya](https://rapidapi.com/apiheya/api/expedia13) via RapidAPI
  - **API Documentation**: [Expedia13 API Docs](https://rapidapi.com/apiheya/api/expedia13)
  - **Endpoint Used**: `GET /api/v1/car/search-location`
  - **Purpose**: Car rental location search functionality
  - **Rate Limits**: Free tier available with generous limits

### Platform Attribution
- **RapidAPI**: API marketplace and infrastructure
  - Website: [https://rapidapi.com](https://rapidapi.com)
  - Provides API discovery, subscription management, and developer tools

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend Proxy**: Python 3, Flask, Flask-CORS
- **HTTP Client**: Fetch API (frontend), Requests library (backend)

## 🔧 Troubleshooting

### API Key Issues

1. **No API Key Configured**:
   - Click the settings icon (⚙️) in the top right
   - Enter your RapidAPI key
   - Click "Save API Key"
   - Try searching again

2. **API Key Not Working**:
   - Verify your API key is correct
   - Check that you have an active subscription to Expedia13 API
   - Visit: https://rapidapi.com/apiheya/api/expedia13
   - Try regenerating your API key on RapidAPI

### 404 Error (Endpoint Not Found)

1. **Verify API Subscription**:
   - Ensure you have an active subscription to Expedia13 API
   - Check that your subscription includes the `/api/v1/car/search-location` endpoint
   - Visit: https://rapidapi.com/apiheya/api/expedia13

2. **Check API Key**:
   - Verify your API key is correct in settings
   - Make sure there are no extra spaces
   - Clear and re-enter your API key

### CORS Errors

If you see CORS (Cross-Origin Resource Sharing) errors:
- RapidAPI APIs typically allow CORS, so this should not occur
- If it does, use the optional backend proxy server (`server.py`)

### Network Errors

- Check your internet connection
- Verify the API server is accessible
- Check browser console for detailed error messages

## 🚀 Deployment

For detailed deployment instructions to Web01, Web02, and Load Balancer configuration, see **[DEPLOYMENT_SIMPLE.md](DEPLOYMENT_SIMPLE.md)**.

**Deployment Approach**: Simple deployment (static files only)
- ✅ Simpler setup (just static files)
- ✅ No Python/Flask installation needed
- ✅ Faster deployment
- ✅ HTTPS enabled with Let's Encrypt
- ✅ Load balancer configured and working

## 📞 Support

If you encounter any issues:
1. Check that your API key is correctly configured (use settings menu or `config.js`)
2. Verify you have an active subscription to the Expedia13 API on RapidAPI
3. Check your internet connection
4. Review the browser console for detailed error messages
5. Refer to [DEPLOYMENT_SIMPLE.md](DEPLOYMENT_SIMPLE.md) for deployment-specific issues
6. See [RUBRIC_CHECKLIST.md](RUBRIC_CHECKLIST.md) for assignment requirements

---

**Note**: This application is designed for educational purposes. For production use, additional security measures, rate limiting, and error monitoring should be implemented.

