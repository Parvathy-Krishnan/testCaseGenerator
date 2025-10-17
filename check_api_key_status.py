#!/usr/bin/env python3
"""
API Key Status Checker
Tests if the OpenAI API key configured in the environment is active and working
"""

import os
import sys
from openai import OpenAI

def test_api_key_status():
    """Test if OpenAI API key is active and working"""
    
    # Get API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ No OpenAI API key found in environment variables")
        print("Please set OPENAI_API_KEY environment variable")
        return False
        
    print(f"🔑 Found API key: {api_key[:10]}...")
    
    try:
        # Initialize OpenAI client with Comcast gateway
        client = OpenAI(
            api_key=api_key,
            base_url="https://gw.api-dev.de.comcast.com/openai/v1"
        )
        
        print("🚀 Testing API connection...")
        
        # Simple test call to check API status
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5,
            temperature=0,
            timeout=10  # 10 second timeout
        )
        
        print("✅ OpenAI API is working correctly!")
        print(f"📝 Response: {response.choices[0].message.content}")
        print(f"🎯 Model used: {response.model}")
        print(f"🔢 Usage tokens: {response.usage.total_tokens}")
        
        return True
        
    except Exception as e:
        error_msg = str(e).lower()
        print(f"❌ API test failed: {str(e)}")
        
        if "api key" in error_msg or "unauthorized" in error_msg or "invalid" in error_msg:
            print("🔐 Issue: API key appears to be invalid or inactive")
        elif "quota" in error_msg or "billing" in error_msg:
            print("💳 Issue: API quota exceeded or billing issue")
        elif "timeout" in error_msg:
            print("⏱️ Issue: Request timed out - network or gateway issue")
        else:
            print("🔧 Issue: Other API error")
            
        return False

def main():
    print("=" * 50)
    print("🔍 OpenAI API Key Status Check")
    print("=" * 50)
    
    is_active = test_api_key_status()
    
    print("\n" + "=" * 50)
    if is_active:
        print("🟢 RESULT: API Key is ACTIVE and working")
        sys.exit(0)
    else:
        print("🔴 RESULT: API Key is INACTIVE or has issues")
        sys.exit(1)

if __name__ == "__main__":
    main()