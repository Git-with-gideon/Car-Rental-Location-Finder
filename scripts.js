/**
 * Car Rental Location Finder - Frontend Application
 * 
 * This application provides a user-friendly interface for searching car rental
 * locations worldwide using the Expedia13 API. Features include:
 * - Location search by city, airport, or neighborhood
 * - Real-time filtering by location type
 * - Advanced sorting options
 * - Comprehensive error handling
 * 
 * @author [Your Name]
 * @createdFor Playing Around with APIs Assignment
 */

// API Configuration - Load from config.js
let API_CONFIG = {
    apiKey: '',
    apiHost: '',
    useProxy: false,  // Set to true to use backend proxy (solves CORS issues)
    proxyUrl: 'http://localhost:5000/api/search-location'  // Backend proxy URL
};

// Global state - stores all search results and filtered results
let allResults = [];
let filteredResults = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load API configuration
    if (typeof CONFIG !== 'undefined') {
        API_CONFIG = CONFIG;
    }

    // Verify API configuration
    if (!API_CONFIG.apiKey || API_CONFIG.apiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
        console.warn('API key not configured. Please update config.js with your RapidAPI key.');
    }

    // Search button event
    document.getElementById('search-button').addEventListener('click', handleSearch);
    
    // Enter key support
    document.getElementById('location-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filter and sort event listeners
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-option').addEventListener('change', applyFilters);
    document.getElementById('search-filter').addEventListener('input', applyFilters);
});

// Main search handler
async function handleSearch() {
    const locationInput = document.getElementById('location-input').value.trim();
    const searchButton = document.getElementById('search-button');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');
    const resultsDiv = document.getElementById('results');
    const filtersSection = document.getElementById('filters-section');

    // Validation
    if (!locationInput) {
        showError('Please enter a location to search.');
        return;
    }

    // Check API configuration
    if (!API_CONFIG.apiKey || !API_CONFIG.apiHost) {
        showError('API configuration is missing. Please check config.js file.');
        return;
    }

    // Reset UI
    errorDiv.classList.add('hidden');
    resultsDiv.innerHTML = '';
    filtersSection.classList.add('hidden');
    searchButton.disabled = true;
    loadingDiv.classList.remove('hidden');

    try {
        const data = await searchCarRentalLocation(locationInput);
        
        if (data && data.status && data.data && data.data.length > 0) {
            allResults = data.data;
            filteredResults = [...allResults];
            displayResults(filteredResults);
            filtersSection.classList.remove('hidden');
            resetFilters();
        } else {
            showError('No locations found. Try a different search term.');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError(handleApiError(error));
    } finally {
        searchButton.disabled = false;
        loadingDiv.classList.add('hidden');
    }
}

// API call function
async function searchCarRentalLocation(query) {
    // Use proxy if configured, otherwise use direct API call
    if (API_CONFIG.useProxy) {
        return await searchViaProxy(query);
    } else {
        return await searchDirect(query);
    }
}

// Direct API call (may have CORS issues)
async function searchDirect(query) {
    // Correct endpoint from RapidAPI playground
    const baseUrl = 'https://expedia13.p.rapidapi.com';
    const endpoint = '/api/v1/car/search-location';
    const url = `${baseUrl}${endpoint}?query=${encodeURIComponent(query)}`;
    
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_CONFIG.apiKey,
            'X-RapidAPI-Host': API_CONFIG.apiHost
        }
    };

    console.log('API Request (Direct):', {
        url: url,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_CONFIG.apiKey ? `${API_CONFIG.apiKey.substring(0, 10)}...` : 'MISSING',
            'X-RapidAPI-Host': API_CONFIG.apiHost
        }
    });

    try {
        const response = await fetch(url, options);
        
        // Log response details for debugging
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = '';
            let errorData = null;
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
                } else {
                    errorMessage = await response.text();
                }
            } catch (e) {
                errorMessage = `Unable to parse error response: ${e.message}`;
            }
            
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                url: url,
                errorData: errorData,
                errorMessage: errorMessage
            });

            // Provide specific error messages based on status code
            if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication failed. Please verify:\n1. Your API key is correct in config.js\n2. You have an active subscription to Expedia13 API on RapidAPI\n3. Your subscription hasn\'t expired');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 404) {
                // 404 could mean endpoint doesn't exist or subscription issue
                throw new Error(`Endpoint not found (404). Possible causes:\n1. The endpoint path may be incorrect\n2. Your API subscription may not include this endpoint\n3. The API may have changed\n4. CORS issue - try using the backend proxy\n\nPlease verify your subscription at: https://rapidapi.com/apiheya/api/expedia13\n\nRequested URL: ${url}\n\n💡 Tip: If you see CORS errors, use the backend proxy server (see README)`);
            } else if (response.status === 500 || response.status >= 500) {
                throw new Error(`Server error (${response.status}). The API server may be experiencing issues. Please try again later.`);
            } else {
                throw new Error(`API request failed (${response.status}): ${errorMessage || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('API Success - Data received:', data);
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format from API');
        }
        
        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        
        // Handle network/CORS errors
        if (error.name === 'TypeError') {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Network error: Unable to connect to the API. This could be due to:\n1. No internet connection\n2. CORS policy blocking the request\n3. API server is down\n\n💡 Solution: Use the backend proxy server (see README for setup instructions)');
            }
        }
        
        // Re-throw our custom errors
        throw error;
    }
}

// Proxy API call (solves CORS issues)
async function searchViaProxy(query) {
    const url = `${API_CONFIG.proxyUrl}?query=${encodeURIComponent(query)}`;
    
    console.log('API Request (via Proxy):', url);

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Proxy error: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Success (via Proxy) - Data received:', data);
        return data;
    } catch (error) {
        console.error('Proxy Error:', error);
        throw new Error(`Proxy server error: ${error.message}\n\nMake sure the backend server is running on ${API_CONFIG.proxyUrl}`);
    }
}

// Display results
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No results match your filters. Try adjusting your search criteria.</div>
            </div>
        `;
        return;
    }

    const resultsCount = document.createElement('div');
    resultsCount.className = 'results-count';
    resultsCount.textContent = `Found ${results.length} location${results.length !== 1 ? 's' : ''}`;
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(resultsCount);

    results.forEach((location, index) => {
        const card = createLocationCard(location, index);
        resultsDiv.appendChild(card);
    });
}

// Create location card
function createLocationCard(location, index) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const type = location.type || 'UNKNOWN';
    const regionNames = location.regionNames || {};
    const coordinates = location.coordinates || {};
    const hierarchyInfo = location.hierarchyInfo || {};
    const country = hierarchyInfo.country || {};
    const airport = hierarchyInfo.airport || {};

    const displayName = regionNames.displayName || regionNames.fullName || 'Unknown Location';
    const primaryName = regionNames.primaryDisplayName || regionNames.shortName || displayName;
    const secondaryName = regionNames.secondaryDisplayName || country.name || '';
    const countryName = country.name || '';
    const countryCode = country.isoCode2 || '';
    const airportCode = airport.airportCode || '';
    const lat = coordinates.lat || '';
    const long = coordinates.long || '';

    const typeClass = type.toLowerCase();
    const typeLabel = type === 'AIRPORT' ? 'Airport' : 
                     type === 'CITY' ? 'City' : 
                     type === 'NEIGHBORHOOD' ? 'Neighborhood' : type;

    card.innerHTML = `
        <div class="result-header">
            <div>
                <div class="result-title">${escapeHtml(primaryName)}</div>
                ${secondaryName ? `<div class="result-subtitle">${escapeHtml(secondaryName)}</div>` : ''}
            </div>
            <span class="type-badge ${typeClass}">${typeLabel}</span>
        </div>
        <div class="result-details">
            ${displayName !== primaryName ? `
                <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${escapeHtml(displayName)}</div>
                </div>
            ` : ''}
            ${countryName ? `
                <div class="detail-item">
                    <div class="detail-label">Country</div>
                    <div class="detail-value">${escapeHtml(countryName)} ${countryCode ? `(${countryCode})` : ''}</div>
                </div>
            ` : ''}
            ${airportCode ? `
                <div class="detail-item">
                    <div class="detail-label">Airport Code</div>
                    <div class="detail-value">${escapeHtml(airportCode)}</div>
                </div>
            ` : ''}
            ${lat && long ? `
                <div class="detail-item">
                    <div class="detail-label">Coordinates</div>
                    <div class="detail-value coordinates">${lat}, ${long}</div>
                </div>
            ` : ''}
            ${location.gaiaId ? `
                <div class="detail-item">
                    <div class="detail-label">Location ID</div>
                    <div class="detail-value">${location.gaiaId}</div>
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

// Apply filters and sorting
function applyFilters() {
    const typeFilter = document.getElementById('type-filter').value;
    const sortOption = document.getElementById('sort-option').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase().trim();

    // Start with all results
    filteredResults = [...allResults];

    // Apply type filter
    if (typeFilter !== 'all') {
        filteredResults = filteredResults.filter(location => location.type === typeFilter);
    }

    // Apply search filter
    if (searchFilter) {
        filteredResults = filteredResults.filter(location => {
            const regionNames = location.regionNames || {};
            const searchText = [
                regionNames.fullName,
                regionNames.shortName,
                regionNames.displayName,
                regionNames.primaryDisplayName,
                regionNames.secondaryDisplayName,
                location.hierarchyInfo?.country?.name
            ].filter(Boolean).join(' ').toLowerCase();
            
            return searchText.includes(searchFilter);
        });
    }

    // Apply sorting
    filteredResults.sort((a, b) => {
        const regionNamesA = a.regionNames || {};
        const regionNamesB = b.regionNames || {};

        switch (sortOption) {
            case 'name':
                const nameA = (regionNamesA.primaryDisplayName || regionNamesA.shortName || '').toLowerCase();
                const nameB = (regionNamesB.primaryDisplayName || regionNamesB.shortName || '').toLowerCase();
                return nameA.localeCompare(nameB);
            
            case 'country':
                const countryA = (a.hierarchyInfo?.country?.name || '').toLowerCase();
                const countryB = (b.hierarchyInfo?.country?.name || '').toLowerCase();
                return countryA.localeCompare(countryB);
            
            case 'relevance':
            default:
                // Sort by index (relevance) - lower index is more relevant
                return (a.index || 999) - (b.index || 999);
        }
    });

    displayResults(filteredResults);
}

// Reset filters
function resetFilters() {
    document.getElementById('type-filter').value = 'all';
    document.getElementById('sort-option').value = 'relevance';
    document.getElementById('search-filter').value = '';
}

// Error handling
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
}

function handleApiError(error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Network error: Please check your internet connection and try again.';
    }
    if (error.message.includes('Authentication') || error.message.includes('API key')) {
        return 'Authentication error: Please check your API key configuration.';
    }
    if (error.message.includes('Rate limit')) {
        return 'Rate limit exceeded: Please wait a moment before trying again.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

