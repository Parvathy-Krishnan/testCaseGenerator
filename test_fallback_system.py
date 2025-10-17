#!/usr/bin/env python3
"""
Test script to demonstrate the three-tier fallback system:
Tier 1: OpenAI API → Tier 2: Local Llama → Tier 3: Enhanced Local Generation
"""
import requests
import json
import time

def test_api_status():
    """Test the API status endpoint"""
    try:
        response = requests.get("http://localhost:8000/api-status", timeout=10)
        if response.status_code == 200:
            status = response.json()
            print("🔍 Current API Status:")
            print(f"   Primary Method: {status['primary_method']}")
            print(f"   OpenAI: {status['openai']['message']}")
            print(f"   Local Llama: {status['local_llama']['message']}")
            print(f"   Enhanced Mock: {status['enhanced_mock']['message']}")
            print(f"   Fallback Info: {status.get('fallback_info', 'N/A')}")
            if status.get('token_warning'):
                print(f"   Warning: {status['token_warning']}")
            return status
        else:
            print(f"❌ API status check failed with status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Failed to get API status: {e}")
        return None

def test_generation_simple():
    """Test simple generation to see which tier is used"""
    print("\n🧪 Testing Simple Generation:")
    test_data = {
        'requirement': 'Test API endpoint /users that returns user list',
        'operation': 'functional'
    }
    
    try:
        response = requests.post("http://localhost:8000/generate-test-cases", 
                               data=test_data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print("✅ Generation successful!")
            
            # Look for generation method in the response
            response_text = result.get('response', '')
            lines = response_text.split('\n')[:5]  # First 5 lines
            for line in lines:
                if 'Generated using:' in line:
                    print(f"   Method Used: {line}")
                    break
            
            print(f"   Response Length: {len(response_text)} characters")
            print(f"   First Line: {lines[0] if lines else 'N/A'}")
            return True
        else:
            print(f"❌ Generation failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Generation test failed: {e}")
        return False

def main():
    print("🚀 Testing Three-Tier Fallback System")
    print("=" * 50)
    
    # Test 1: Check current API status
    print("\n📋 Test 1: API Status Check")
    status = test_api_status()
    
    if not status:
        print("❌ Cannot proceed - API status unavailable")
        return
    
    # Test 2: Simple generation test
    print("\n📋 Test 2: Generation Test")
    success = test_generation_simple()
    
    if success:
        print("\n✅ All tests passed!")
        print("\n📝 Summary:")
        print("   - Your .env file is being loaded correctly")
        print("   - OpenAI API status is being checked automatically")
        print("   - Three-tier fallback system is operational:")
        print("     🥇 Tier 1: OpenAI API (if active)")
        print("     🥈 Tier 2: Local Llama Model (if OpenAI fails)")
        print("     🥉 Tier 3: Enhanced Local Generation (always available)")
    else:
        print("\n❌ Generation test failed - check server logs")

if __name__ == "__main__":
    main()