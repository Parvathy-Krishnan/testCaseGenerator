#!/usr/bin/env python3

import requests
import json

# Test the automation endpoint with a sample Karate scenario
def test_automation_endpoint():
    url = "http://127.0.0.1:8000/run-automation-script"
    
    # Sample Karate test case
    karate_automation = """Feature: Sample API Test

Background:
  * url 'https://jsonplaceholder.typicode.com'

Scenario: Test GET posts
  Given path '/posts/1'
  When method GET
  Then status 200
  And match response.userId == 1"""
    
    # Create the payload
    payload = {
        "apiEndpoint": "https://jsonplaceholder.typicode.com/posts/1",
        "method": "GET",
        "username": None,
        "password": None,
        "token": None,
        "body": None,
        "resourceId": "1",
        "acceptHeader": "application/json",
        "generatedTestCases": [karate_automation]
    }
    
    print("📤 Testing automation endpoint...")
    print(f"🎯 URL: {url}")
    print(f"📋 Payload preview: {str(payload)[:100]}...")
    
    try:
        response = requests.post(
            url, 
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: No 500 Internal Server Error!")
            response_data = response.json()
            print(f"🎉 Response data: {json.dumps(response_data, indent=2)}")
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"💥 Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"💥 Error text: {response.text}")
                
    except Exception as e:
        print(f"💥 Exception occurred: {str(e)}")

if __name__ == "__main__":
    test_automation_endpoint()