#!/usr/bin/env python3
"""
Car Rental Location Finder - Backend Proxy Server

This Flask-based proxy server solves CORS (Cross-Origin Resource Sharing) issues
by making API calls server-side. It also provides centralized error handling
and logging for better debugging.

Author: [Your Name]
Created for: Playing Around with APIs Assignment
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get API key from environment variable or config
API_KEY = os.getenv('RAPIDAPI_KEY', '6d398f9885mshf33fdc49d9a4d79p193a55jsn813d5bc2972a')
API_HOST = 'expedia13.p.rapidapi.com'

# Endpoint path - confirmed from RapidAPI playground
ENDPOINT_PATH = '/api/v1/car/search-location'

@app.route('/api/search-location', methods=['GET'])
def search_location():
    """Proxy endpoint for searching car rental locations"""
    query = request.args.get('query')
    
    if not query:
        return jsonify({
            'status': False,
            'message': 'Query parameter is required',
            'error': 'Missing query parameter'
        }), 400
    
    # Use the configured endpoint path
    url = f'https://{API_HOST}{ENDPOINT_PATH}'
    params = {'query': query}
    
    headers = {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
    }
    
    try:
        print(f'🔍 Calling endpoint: {url} with query: {query}')
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        # Log response for debugging
        print(f'📡 Response status: {response.status_code}')
        
        if response.status_code == 200:
            print(f'✅ Success!')
            return jsonify(response.json()), 200
        else:
            # Log error details
            try:
                error_data = response.json()
                print(f'❌ Error response: {error_data}')
                return jsonify(error_data), response.status_code
            except:
                error_text = response.text[:500]
                print(f'❌ Error text: {error_text}')
                return jsonify({
                    'status': False,
                    'message': f'API returned status {response.status_code}',
                    'error': error_text,
                    'endpoint_used': ENDPOINT_PATH,
                    'suggestion': 'Please verify the endpoint path in server.py matches the RapidAPI documentation'
                }), response.status_code
                
    except requests.exceptions.Timeout:
        return jsonify({
            'status': False,
            'message': 'Request timeout. The API took too long to respond.',
            'error': 'Timeout'
        }), 504
        
    except requests.exceptions.ConnectionError:
        return jsonify({
            'status': False,
            'message': 'Unable to connect to the API. Please check your internet connection.',
            'error': 'Connection Error'
        }), 503
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'status': False,
            'message': f'API request failed: {str(e)}',
            'error': 'Request Exception'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Server is running',
        'api_host': API_HOST
    }), 200

if __name__ == '__main__':
    print('🚀 Starting Car Rental Location Finder API Server...')
    print(f'📡 API Host: {API_HOST}')
    print(f'🔑 API Key: {API_KEY[:10]}...' if API_KEY else '⚠️  API Key not set!')
    print('🌐 Server running on http://localhost:5000')
    print('📝 API endpoint: http://localhost:5000/api/search-location?query=Kigali')
    print('\nPress Ctrl+C to stop the server\n')
    
    app.run(debug=True, port=5000)

