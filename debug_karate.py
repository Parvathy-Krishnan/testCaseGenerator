#!/usr/bin/env python3
"""
Debug test for Karate automation script execution error
Simulates the exact request that causes the 500 Internal Server Error
"""

import json
import sys
import os

# Add the workspace to Python path
workspace_dir = "/Users/pkrish529/Documents/pk_workspace/testCaseGenerator"
sys.path.insert(0, workspace_dir)

# Import the function we want to test
from main import parse_karate_feature_to_test_cases, RestAssuredRequest

def test_karate_parsing():
    """Test the parse_karate_feature_to_test_cases function with sample data"""
    
    # Sample raw Karate feature content (similar to what frontend sends)
    sample_karate_content = """Feature: railCollections API Testing
  
  Background:
    * url 'https://csg-api.comcast.net/int/cmts/railCollections'
    * header Accept = 'application/json'
    
  # Positive Test Case: Verify successful retrieval of rail collections data
  # Requirement: REQ-RAIL-001
  Scenario: Successful retrieval of rail collections
    Given path 'railCollections'
    When method GET
    Then status 200
    And match response contains { data: '#notnull' }
    
  # Negative Test Case: Test with invalid path parameter
  # Requirement: REQ-RAIL-002  
  Scenario: Test with invalid path parameter
    Given path 'invalidPath'
    When method GET
    Then status 404
    And match response.error == 'Resource not found'"""

    print("Testing parse_karate_feature_to_test_cases function...")
    print(f"Sample content length: {len(sample_karate_content)} chars")
    
    try:
        # Test the parsing function
        parsed_cases = parse_karate_feature_to_test_cases(sample_karate_content)
        
        print(f"✅ Parsing successful!")
        print(f"Number of parsed test cases: {len(parsed_cases)}")
        
        for i, case in enumerate(parsed_cases):
            print(f"\nTest Case {i+1}:")
            print(f"  Scenario: {case.get('Test Scenario', 'N/A')}")
            print(f"  HTTP Method: {case.get('HTTP Method', 'N/A')}")
            print(f"  API Path: {case.get('API Path', 'N/A')}")
            print(f"  Expected Status: {case.get('Expected Status', 'N/A')}")
            print(f"  Test Type: {case.get('Test Type', 'N/A')}")
            print(f"  Number of Karate Steps: {len(case.get('Karate Steps', []))}")
            
        return True
        
    except Exception as e:
        print(f"❌ Parsing failed with error: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_restassured_request():
    """Test creating RestAssuredRequest with the parsed data"""
    
    sample_karate_content = """Feature: railCollections API Testing
  
  # Test case 1
  Scenario: Successful retrieval of rail collections
    Given path 'railCollections'
    When method GET
    Then status 200"""
    
    print("\nTesting RestAssuredRequest creation...")
    
    try:
        # Create request similar to what frontend sends
        request_data = {
            "apiEndpoint": "https://csg-api.comcast.net/int/cmts/railCollections",
            "method": "GET", 
            "username": "test_user",
            "password": "test_pass",
            "generatedTestCases": [sample_karate_content]  # Raw string array
        }
        
        # Create RestAssuredRequest instance
        request = RestAssuredRequest(**request_data)
        
        print(f"✅ RestAssuredRequest created successfully!")
        print(f"API Endpoint: {request.apiEndpoint}")
        print(f"Method: {request.method}")
        print(f"Generated test cases count: {len(request.generatedTestCases or [])}")
        print(f"First test case type: {type(request.generatedTestCases[0])}")
        print(f"First test case preview: {str(request.generatedTestCases[0])[:100]}...")
        
        return request
        
    except Exception as e:
        print(f"❌ RestAssuredRequest creation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def test_automation_pipeline():
    """Test the complete automation pipeline step by step"""
    
    print("\n" + "="*60)
    print("TESTING COMPLETE AUTOMATION PIPELINE")
    print("="*60)
    
    # Step 1: Test parsing function
    print("\nStep 1: Testing Karate parsing function...")
    parsing_success = test_karate_parsing()
    
    if not parsing_success:
        print("❌ Pipeline test failed at parsing stage")
        return False
    
    # Step 2: Test RestAssuredRequest creation
    print("\nStep 2: Testing RestAssuredRequest creation...")
    request = test_restassured_request()
    
    if not request:
        print("❌ Pipeline test failed at request creation stage")
        return False
    
    # Step 3: Test the problematic section (similar to line 1320-1340 in main.py)
    print("\nStep 3: Testing raw content detection and parsing...")
    try:
        processed_test_cases = []
        
        for i, test_case in enumerate(request.generatedTestCases):
            if isinstance(test_case, str):
                print(f"✅ Detected raw Karate content in test case {i+1}")
                print(f"Raw content preview: {test_case[:100]}...")
                
                # Join all raw strings to create a complete feature file
                raw_feature_content = '\n'.join([str(tc) for tc in request.generatedTestCases])
                
                # Parse the raw Karate feature content
                parsed_test_cases = parse_karate_feature_to_test_cases(raw_feature_content)
                processed_test_cases = parsed_test_cases
                print(f"✅ Parsed {len(parsed_test_cases)} structured test cases")
                break
        
        if processed_test_cases:
            print(f"✅ Pipeline test successful! Processed {len(processed_test_cases)} test cases")
            return True
        else:
            print("❌ No test cases were processed")
            return False
            
    except Exception as e:
        print(f"❌ Pipeline test failed at processing stage: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting Karate automation debugging...")
    success = test_automation_pipeline()
    
    if success:
        print("\n🎉 All pipeline tests passed! The issue might be elsewhere.")
    else:
        print("\n💥 Pipeline test failed - found the root cause!")