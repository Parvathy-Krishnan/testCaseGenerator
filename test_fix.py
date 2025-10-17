#!/usr/bin/env python3
"""
Test the fixed create_test_request function to ensure it doesn't cause validation errors
"""

import json
import sys
import os

# Add the workspace to Python path
workspace_dir = "/Users/pkrish529/Documents/pk_workspace/testCaseGenerator"
sys.path.insert(0, workspace_dir)

# Import the functions we want to test
from main import RestAssuredRequest, create_test_request, extract_test_data, extract_expected_status

def test_create_test_request_fix():
    """Test that create_test_request works with proper RestAssuredRequest fields"""
    
    # Create a sample base request 
    base_request = RestAssuredRequest(
        apiEndpoint="https://csg-api.comcast.net/int/cmts/railCollections",
        method="GET",
        username="test_user",
        password="test_pass",
        body="",
        acceptHeader="application/json"
    )
    
    # Create a sample test case (from our parsing function)
    test_case = {
        "Test Scenario": "Successful retrieval of rail collections",
        "Test Description": "Positive test scenario", 
        "Test Objective": "Validate GET railCollections returns 200",
        "Test Type": "positive",
        "HTTP Method": "GET",
        "API Path": "railCollections",
        "Expected Result": "Status 200",
        "Expected Status": 200,
        "Karate Steps": [
            "Given path 'railCollections'",
            "When method GET", 
            "Then status 200",
            "And match response contains { data: '#notnull' }"
        ],
        "Test Data": {
            "method": "GET",
            "path": "railCollections",
            "expectedStatus": 200
        }
    }
    
    print("Testing create_test_request function...")
    
    try:
        # Test extract_test_data first
        print("Step 1: Testing extract_test_data...")
        test_data = extract_test_data(test_case, base_request)
        print(f"✅ extract_test_data successful: {json.dumps(test_data, indent=2)}")
        
        # Test extract_expected_status
        print("Step 2: Testing extract_expected_status...")
        expected_status = extract_expected_status(test_case)
        print(f"✅ extract_expected_status successful: {expected_status}")
        
        # Test create_test_request - this was the problematic function
        print("Step 3: Testing create_test_request...")
        test_request = create_test_request(base_request, test_case, test_data)
        
        print(f"✅ create_test_request successful!")
        print(f"Request details:")
        print(f"  apiEndpoint: {test_request.apiEndpoint}")
        print(f"  method: {test_request.method}")
        print(f"  username: {test_request.username}")
        print(f"  body: {test_request.body}")
        print(f"  acceptHeader: {test_request.acceptHeader}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_validation_error_simulation():
    """Test that the old problematic approach would fail"""
    print("\nTesting that old problematic approach would fail...")
    
    try:
        # Try to create RestAssuredRequest with invalid fields (the old way)
        problematic_request = RestAssuredRequest(
            apiEndpoint="https://test.com",
            method="GET",
            httpMethod="GET",  # This field doesn't exist - should cause error
            requestBody={},    # This field doesn't exist - should cause error 
            headers={},        # This field doesn't exist - should cause error
            authToken="token"  # This field doesn't exist - should cause error
        )
        print("❌ Validation should have failed but didn't!")
        return False
        
    except Exception as e:
        print(f"✅ Expected validation error occurred: {str(e)[:100]}...")
        return True

if __name__ == "__main__":
    print("Testing the create_test_request fix...")
    
    # Test the fix
    success = test_create_test_request_fix()
    
    # Test that the old way would fail
    validation_success = test_validation_error_simulation()
    
    if success and validation_success:
        print("\n🎉 All tests passed! The fix should resolve the 500 Internal Server Error.")
    else:
        print("\n💥 Tests failed - more investigation needed.")