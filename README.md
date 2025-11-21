# Car Rental Location Finder

A modern web application for searching car rental locations worldwide using the Expedia13 API. This application provides an intuitive interface to find airports, cities, and neighborhoods where car rental services are available.

> **📋 Rubric Checklist**: See [RUBRIC_CHECKLIST.md](RUBRIC_CHECKLIST.md) to verify all assignment requirements are met.

## 🚀 Features

- **Location Search**: Search for car rental locations by city, airport, or neighborhood name
- **Smart Filtering**: Filter results by type (Airport, City, Neighborhood)
- **Advanced Sorting**: Sort results by relevance, name, or country
- **In-Result Search**: Search within results for quick filtering
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

1. Open the `config.js` file
2. Replace `YOUR_RAPIDAPI_KEY_HERE` with your actual RapidAPI key:
   ```javascript
   const CONFIG = {
       apiKey: 'your-actual-api-key-here',
       apiHost: 'expedia13.p.rapidapi.com'
   };
   ```

### Step 3: Run the Application

**Option A: Direct API Calls (May have CORS/404 issues)**

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

**Option B: Using Backend Proxy (Recommended - Solves CORS/404 issues)**

If you encounter 404 errors or CORS issues, use the backend proxy:

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set your API key in `config.js` (the server will read it from there)

3. Start the backend server:
   ```bash
   python server.py
   ```

4. Update `config.js` to use the proxy:
   ```javascript
   const CONFIG = {
       apiKey: 'your-api-key-here',
       apiHost: 'expedia13.p.rapidapi.com',
       useProxy: true,  // Enable proxy mode
       proxyUrl: 'http://localhost:5000/api/search-location'
   };
   ```

5. Open `index.html` in your browser (the proxy will handle all API calls)

## 📖 How to Use

1. **Search for Locations**: 
   - Enter a city, airport code, or location name in the search box
   - Examples: "Kigali", "New York", "LAX", "London"
   - Press Enter or click the Search button

2. **Filter Results**:
   - Use the "Filter by Type" dropdown to show only Airports, Cities, or Neighborhoods
   - Use the "Sort by" dropdown to organize results
   - Use the search box to filter results by name

3. **View Details**:
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
├── server.py               # Backend proxy server (solves CORS, optional for local dev)
├── requirements.txt        # Python dependencies for proxy server
├── .gitignore              # Git ignore rules (excludes config.js and sensitive files)
├── README.md               # Comprehensive documentation
├── DEPLOYMENT.md           # Detailed deployment instructions for Web01, Web02, Lb01
└── RUBRIC_CHECKLIST.md     # Assignment rubric checklist
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

### Challenge 1: API Response Structure
**Problem**: The API returns nested data structures that needed careful parsing.

**Solution**: Created helper functions to safely extract data with fallback values, ensuring the UI never breaks even if some fields are missing.

### Challenge 2: Real-time Filtering
**Problem**: Implementing smooth filtering and sorting without page reloads.

**Solution**: Used JavaScript array methods (filter, sort) to manipulate results in memory, providing instant feedback to users.

### Challenge 3: Error Handling
**Problem**: Different API errors require different user messages.

**Solution**: Created a centralized error handling function that maps error types to user-friendly messages, improving the user experience.

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

### 404 Error (Endpoint Not Found)

If you see a 404 error, try these solutions:

1. **Use Backend Proxy** (Recommended):
   - The backend proxy (`server.py`) solves both CORS and endpoint issues
   - Follow "Option B" in Step 3 above
   - The proxy handles API calls server-side, avoiding browser restrictions

2. **Verify API Subscription**:
   - Ensure you have an active subscription to Expedia13 API
   - Check that your subscription includes the `/api/v1/car/search-location` endpoint
   - Visit: https://rapidapi.com/apiheya/api/expedia13

3. **Check API Key**:
   - Verify your API key is correct in `config.js`
   - Make sure there are no extra spaces or quotes
   - Try regenerating your API key on RapidAPI

### CORS Errors

If you see CORS (Cross-Origin Resource Sharing) errors:
- **Solution**: Use the backend proxy server (see Option B in Setup)
- The proxy server makes API calls from the server side, bypassing CORS restrictions

### Network Errors

- Check your internet connection
- Verify the API server is accessible
- Try the test page to diagnose network issues

## 🚀 Deployment

For detailed deployment instructions to Web01, Web02, and Load Balancer configuration, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

Quick deployment overview:
1. Deploy application files to both Web01 and Web02
2. Configure backend proxy service on each web server
3. Set up Nginx/Apache web server on each instance
4. Configure load balancer (Lb01) to distribute traffic
5. Test and verify load balancing functionality

## 📞 Support

If you encounter any issues:
1. Check that your API key is correctly configured in `config.js`
2. Verify you have an active subscription to the Expedia13 API on RapidAPI
3. Try the backend proxy solution (Option B in Setup)
4. Check your internet connection
5. Review the browser console for detailed error messages
6. Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-specific issues

---

**Note**: This application is designed for educational purposes. For production use, additional security measures, rate limiting, and error monitoring should be implemented.

