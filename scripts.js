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

// User authentication state
let currentUser = null;

// Cache configuration
const CACHE_CONFIG = {
    enabled: true,
    expirationTime: 30 * 60 * 1000, // 30 minutes in milliseconds
    maxCacheSize: 50 // Maximum number of cached queries
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load API configuration from config.js
    if (typeof CONFIG !== 'undefined') {
        API_CONFIG = CONFIG;
    }

    // Load saved API key from localStorage
    loadSavedApiKey();

    // Initialize authentication
    initializeAuth();

    // Initialize settings modal
    initializeSettings();

    // Verify API configuration
    updateApiKeyStatus();
    
    // Load cached data if available
    loadCacheStats();

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
    
    // Clear cache button (now in settings modal)
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all cached search results?')) {
                clearCache();
                showNotification('Cache cleared successfully', 'success');
            }
        });
    }
});

// Load saved API key from localStorage
function loadSavedApiKey() {
    const savedKey = localStorage.getItem('rapidapi_key');
    if (savedKey) {
        API_CONFIG.apiKey = savedKey;
        console.log('API key loaded from local storage');
    }
}

// Save API key to localStorage
function saveApiKey(key) {
    if (key && key.trim()) {
        localStorage.setItem('rapidapi_key', key.trim());
        API_CONFIG.apiKey = key.trim();
        console.log('API key saved to local storage');
        return true;
    }
    return false;
}

// Clear saved API key
function clearApiKey() {
    localStorage.removeItem('rapidapi_key');
    API_CONFIG.apiKey = '';
    console.log('API key cleared from local storage');
}

// Update API key status indicator
function updateApiKeyStatus() {
    const statusIndicator = document.getElementById('api-key-status');
    const statusText = document.getElementById('status-text');
    const apiKeyInput = document.getElementById('api-key-input');

    if (API_CONFIG.apiKey && API_CONFIG.apiKey !== 'YOUR_RAPIDAPI_KEY_HERE') {
        statusIndicator.className = 'status-indicator configured';
        statusText.textContent = '✓ API key configured';
        if (apiKeyInput) {
            apiKeyInput.value = API_CONFIG.apiKey;
        }
    } else {
        statusIndicator.className = 'status-indicator not-configured';
        statusText.textContent = '⚠ API key not configured';
        if (apiKeyInput) {
            apiKeyInput.value = '';
        }
    }
}

// Initialize settings modal
function initializeSettings() {
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeButton = document.getElementById('close-settings');
    const modalOverlay = document.getElementById('modal-overlay');
    const saveButton = document.getElementById('save-api-key');
    const clearButton = document.getElementById('clear-api-key');
    const apiKeyInput = document.getElementById('api-key-input');

    // Open settings modal
    settingsButton.addEventListener('click', function() {
        settingsModal.classList.remove('hidden');
        updateApiKeyStatus();
        updateAuthUI(); // Refresh account section
        loadCacheStats(); // Refresh cache stats
        // Focus on input
        setTimeout(() => apiKeyInput.focus(), 100);
    });

    // Close settings modal
    function closeModal() {
        settingsModal.classList.add('hidden');
    }

    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Save API key
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            if (saveApiKey(apiKey)) {
                updateApiKeyStatus();
                // Show success message
                showNotification('API key saved successfully!', 'success');
                // Close modal after a short delay
                setTimeout(closeModal, 1000);
            } else {
                showNotification('Please enter a valid API key', 'error');
            }
        } else {
            showNotification('Please enter an API key', 'error');
        }
    });

    // Clear API key
    clearButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the saved API key?')) {
            clearApiKey();
            updateApiKeyStatus();
            apiKeyInput.value = '';
            showNotification('API key cleared', 'info');
        }
    });

    // Allow Enter key to save
    apiKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#2196F3';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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
    if (!API_CONFIG.apiKey || API_CONFIG.apiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
        showError('API key is not configured. Please click the settings icon (⚙️) in the header to enter your RapidAPI key.');
        // Auto-open settings if no key
        document.getElementById('settings-button').click();
        return;
    }

    if (!API_CONFIG.apiHost) {
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

// API call function with caching
async function searchCarRentalLocation(query) {
    // Check cache first
    const cached = getCachedResponse(query);
    if (cached) {
        return cached;
    }
    
    // Use proxy if configured, otherwise use direct API call
    let data;
    if (API_CONFIG.useProxy) {
        data = await searchViaProxy(query);
    } else {
        data = await searchDirect(query);
    }
    
    // Save to cache
    if (data) {
        saveToCache(query, data);
    }
    
    return data;
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
    
    // Add event listeners for favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const locationIndex = parseInt(this.getAttribute('data-location-id'));
            const location = (filteredResults.length > 0 ? filteredResults : allResults)[locationIndex];
            if (location) {
                toggleFavorite(location);
            }
        });
    });
    
    // Add event listeners for map toggle buttons
    document.querySelectorAll('.map-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const locationIndex = parseInt(this.getAttribute('data-location-index'));
            const mapDiv = document.getElementById(`map-${locationIndex}`);
            if (mapDiv) {
                if (mapDiv.classList.contains('hidden')) {
                    mapDiv.classList.remove('hidden');
                    this.textContent = 'Hide Map';
                } else {
                    mapDiv.classList.add('hidden');
                    this.textContent = 'Show Map';
                }
            }
        });
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

    // Create Google Maps URL for the location
    const mapsUrl = lat && long ? `https://www.google.com/maps?q=${lat},${long}` : null;
    
    // Check if location is in favorites
    const locationId = location.gaiaId || `${displayName}_${lat}_${long}`;
    const isFavorite = currentUser && currentUser.favorites && 
                      currentUser.favorites.some(fav => fav.id === locationId);

    card.innerHTML = `
        <div class="result-header">
            <div>
                ${mapsUrl ? `
                    <div class="result-title">
                        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="title-link" title="View on Google Maps">
                            ${escapeHtml(primaryName)}
                            <svg class="title-map-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </a>
                    </div>
                ` : `
                    <div class="result-title">${escapeHtml(primaryName)}</div>
                `}
                ${secondaryName ? `<div class="result-subtitle">${escapeHtml(secondaryName)}</div>` : ''}
            </div>
            <div class="header-actions">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-location-id="${index}"
                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? '#C41E3A' : 'none'}" stroke="#C41E3A" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <span class="type-badge ${typeClass}">${typeLabel}</span>
            </div>
        </div>
        ${lat && long ? `
        <div class="map-container">
            <div class="map-toggle">
                <button class="map-toggle-btn" data-location-index="${index}">Show Map</button>
            </div>
            <div class="embedded-map hidden" id="map-${index}">
                <iframe 
                    width="100%" 
                    height="250" 
                    style="border:0; border-radius: 8px;" 
                    loading="lazy" 
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=${lat},${long}&output=embed&zoom=12">
                </iframe>
            </div>
        </div>
        ` : ''}
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
                    <div class="detail-value">
                        <a href="https://www.google.com/maps?q=${lat},${long}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="map-link"
                           title="View on Google Maps">
                            <span class="coordinates">${lat}, ${long}</span>
                            <svg class="map-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </a>
                    </div>
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

// ==================== CACHING MECHANISM ====================

/**
 * Get cache key for a query
 */
function getCacheKey(query) {
    return `api_cache_${query.toLowerCase().trim()}`;
}

/**
 * Get cached API response if available and not expired
 */
function getCachedResponse(query) {
    if (!CACHE_CONFIG.enabled) return null;
    
    const cacheKey = getCacheKey(query);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    try {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is expired
        if (now - cacheData.timestamp > CACHE_CONFIG.expirationTime) {
            localStorage.removeItem(cacheKey);
            return null;
        }
        
        console.log('Cache hit for query:', query);
        return cacheData.data;
    } catch (e) {
        console.error('Error reading cache:', e);
        localStorage.removeItem(cacheKey);
        return null;
    }
}

/**
 * Save API response to cache
 */
function saveToCache(query, data) {
    if (!CACHE_CONFIG.enabled) return;
    
    try {
        const cacheKey = getCacheKey(query);
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            query: query
        };
        
        // Clean old cache entries if we exceed max size
        cleanOldCacheEntries();
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('Response cached for query:', query);
        updateCacheStats();
    } catch (e) {
        console.error('Error saving to cache:', e);
        // If storage is full, try to clean up
        if (e.name === 'QuotaExceededError') {
            cleanOldCacheEntries(true);
        }
    }
}

/**
 * Clean old cache entries to free up space
 */
function cleanOldCacheEntries(force = false) {
    const cacheKeys = [];
    const now = Date.now();
    
    // Collect all cache keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api_cache_')) {
            cacheKeys.push(key);
        }
    }
    
    // Remove expired entries
    cacheKeys.forEach(key => {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const cacheData = JSON.parse(cached);
                if (now - cacheData.timestamp > CACHE_CONFIG.expirationTime) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            localStorage.removeItem(key);
        }
    });
    
    // If still too many, remove oldest entries
    if (force || cacheKeys.length > CACHE_CONFIG.maxCacheSize) {
        const entries = cacheKeys.map(key => {
            try {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const cacheData = JSON.parse(cached);
                    return { key, timestamp: cacheData.timestamp };
                }
            } catch (e) {
                return { key, timestamp: 0 };
            }
        }).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest entries
        const toRemove = entries.slice(0, entries.length - CACHE_CONFIG.maxCacheSize);
        toRemove.forEach(entry => localStorage.removeItem(entry.key));
    }
}

/**
 * Clear all cache entries
 */
function clearCache() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api_cache_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    updateCacheStats();
    console.log('Cache cleared');
}

/**
 * Update cache statistics display
 */
function loadCacheStats() {
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api_cache_')) {
            cacheKeys.push(key);
        }
    }
    
    const cacheStatsEl = document.getElementById('cache-stats');
    if (cacheStatsEl) {
        cacheStatsEl.textContent = cacheKeys.length;
    }
}

function updateCacheStats() {
    loadCacheStats();
}

// ==================== USER AUTHENTICATION ====================

/**
 * Initialize authentication system
 */
function initializeAuth() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        } catch (e) {
            console.error('Error loading user:', e);
            localStorage.removeItem('current_user');
        }
    }
    
    // Set up auth modal event listeners
    const loginButton = document.getElementById('login-button');
    const loginFromSettings = document.getElementById('login-from-settings');
    const logoutButton = document.getElementById('logout-button');
    const authModal = document.getElementById('auth-modal');
    const closeAuthButton = document.getElementById('close-auth');
    const authOverlay = document.getElementById('auth-overlay');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            authModal.classList.remove('hidden');
            showLoginForm();
        });
    }
    
    if (loginFromSettings) {
        loginFromSettings.addEventListener('click', () => {
            document.getElementById('settings-modal').classList.add('hidden');
            authModal.classList.remove('hidden');
            showLoginForm();
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    if (closeAuthButton) {
        closeAuthButton.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }
    
    if (authOverlay) {
        authOverlay.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
}

/**
 * Show login form
 */
function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
}

/**
 * Show register form
 */
function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
}

/**
 * Handle user login
 */
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    // Get user from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    
    if (!user || user.password !== password) {
        showNotification('Invalid username or password', 'error');
        return;
    }
    
    // Login successful
    currentUser = {
        username: username,
        email: user.email,
        favorites: user.favorites || [],
        preferences: user.preferences || {}
    };
    
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    updateAuthUI();
    document.getElementById('auth-modal').classList.add('hidden');
    showNotification(`Welcome back, ${username}!`, 'success');
    
    // Clear form
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

/**
 * Handle user registration
 */
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!username || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        showNotification('Username already exists', 'error');
        return;
    }
    
    // Create new user
    users[username] = {
        username: username,
        email: email,
        password: password,
        favorites: [],
        preferences: {},
        createdAt: Date.now()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login
    currentUser = {
        username: username,
        email: email,
        favorites: [],
        preferences: {}
    };
    
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    updateAuthUI();
    document.getElementById('auth-modal').classList.add('hidden');
    showNotification(`Account created! Welcome, ${username}!`, 'success');
    
    // Clear form
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm-password').value = '';
}

/**
 * Handle user logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('current_user');
        updateAuthUI();
        showNotification('Logged out successfully', 'info');
    }
}

/**
 * Update authentication UI based on login state
 */
function updateAuthUI() {
    const loginButton = document.getElementById('login-button');
    const userSectionLoggedIn = document.getElementById('user-section-logged-in');
    const userName = document.getElementById('user-name');
    const accountLoggedOut = document.getElementById('account-logged-out');
    const accountLoggedIn = document.getElementById('account-logged-in');
    const settingsUserName = document.getElementById('settings-user-name');
    const settingsUserEmail = document.getElementById('settings-user-email');
    
    if (currentUser) {
        if (loginButton) loginButton.classList.add('hidden');
        if (userSectionLoggedIn) userSectionLoggedIn.classList.remove('hidden');
        if (userName) userName.textContent = currentUser.username;
        if (accountLoggedOut) accountLoggedOut.classList.add('hidden');
        if (accountLoggedIn) accountLoggedIn.classList.remove('hidden');
        if (settingsUserName) settingsUserName.textContent = currentUser.username;
        if (settingsUserEmail) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser.username];
            settingsUserEmail.textContent = user ? user.email : '';
        }
    } else {
        if (loginButton) loginButton.classList.remove('hidden');
        if (userSectionLoggedIn) userSectionLoggedIn.classList.add('hidden');
        if (accountLoggedOut) accountLoggedOut.classList.remove('hidden');
        if (accountLoggedIn) accountLoggedIn.classList.add('hidden');
    }
}

/**
 * Toggle favorite location (global function for onclick handlers)
 */
window.toggleFavorite = function(location) {
    if (!currentUser) {
        showNotification('Please login to save favorites', 'error');
        document.getElementById('login-button')?.click();
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[currentUser.username];
    
    if (!user) return;
    
    const locationId = location.gaiaId || `${location.regionNames?.fullName}_${location.coordinates?.lat}_${location.coordinates?.long}`;
    const favorites = user.favorites || [];
    const index = favorites.findIndex(fav => fav.id === locationId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        favorites.push({
            id: locationId,
            location: location,
            addedAt: Date.now()
        });
        showNotification('Added to favorites', 'success');
    }
    
    user.favorites = favorites;
    users[currentUser.username] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser.favorites = favorites;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    
    // Update UI if results are displayed
    if (allResults.length > 0) {
        displayResults(filteredResults.length > 0 ? filteredResults : allResults);
    }
}

