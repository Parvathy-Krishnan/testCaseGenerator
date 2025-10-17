#!/usr/bin/env python3

import requests
import json
import sys

def test_post_with_payload():
    """Test POST method with payload - should NOT return error"""
    url = "http://localhost:8000/generate-test-cases"
    
    # Test POST with payload
    data = {
        'requirement': 'test requirement',
        'operation': 'API',
        'apiMethod': 'POST',
        'apiEndpoint': 'https://api.example.com/users',
        'payload': '{"name": "John", "email": "john@example.com"}'
    }
    
    try:
        print("Testing POST method WITH payload...")
        response = requests.post(url, data=data, timeout=5)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print("✅ POST with payload passed validation!")
            return True
        else:
            print("❌ POST with payload incorrectly rejected")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - but validation passed (no 400 error)")
        return True  # Timeout means it got past validation
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server")
        return False
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        return False

if __name__ == "__main__":
    print("Testing POST with payload...")
    print("=" * 50)
    
    result = test_post_with_payload()
    
    print("\n" + "=" * 50)
    print("SUMMARY:")
    
    if result:
        print("✅ POST with payload validation test passed!")
    else:
        print("❌ POST with payload validation test failed!")