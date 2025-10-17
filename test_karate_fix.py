#!/usr/bin/env python3
"""
Test script to verify that Karate Automation Controls now processes generated test cases from Section 2
"""
import requests
import json

def test_karate_automation_with_generated_cases():
    """Test that automation now uses generated test cases instead of default scenarios"""
    
    # Sample generated Karate feature content (similar to what would be in Section 2)
    sample_generated_feature = """Feature: Feed Collection Management API Tests
  This feature file tests the Feed Collection Management functionality for the API endpoint.

  Background:
    * url 'https://manage.discovery.aort-eks-1.eks.aort.theplatform.com/rms/957199622/railcollections'
    * configure headers = { Accept: 'application/json' }

  Scenario: Create a new feed collection with valid inputs
    Given path '/create'
    And request { 
        "title": "My New Feed Collection",
        "description": "This is a test feed collection"
    }
    When method POST
    Then status 201
    And match response == { 
        "id": "#notnull",
        "title": "My New Feed Collection"
    }

  Scenario: Create feed collection without mandatory title
    Given path '/create'
    And request { 
        "description": "Missing title field"
    }
    When method POST
    Then status 400
    And match response.message == 'Title is required'

  Scenario: Unauthorized user attempting feed collection management
    Given path '/create'
    And request { 
        "title": "Unauthorized Access Feed"
    }
    When method POST
    Then status 403
    And match response.message == 'Unauthorized operation'
"""

    print("🧪 Testing Karate Automation with Generated Test Cases")
    print("=" * 60)
    
    # Test with generated test cases included
    test_data = {
        'apiEndpoint': 'https://manage.discovery.aort-eks-1.eks.aort.theplatform.com/rms/957199622/railcollections',
        'method': 'POST',
        'body': '{"title": "Test Feed", "description": "Test Description"}',
        'acceptHeader': 'application/json',
        'generatedTestCases': [sample_generated_feature]  # This is the key fix!
    }
    
    print("📋 Request Data:")
    print(f"   API Endpoint: {test_data['apiEndpoint']}")
    print(f"   Method: {test_data['method']}")
    print(f"   Generated Test Cases: {'INCLUDED' if test_data['generatedTestCases'] else 'NOT INCLUDED'}")
    print(f"   Test Case Content Preview: {sample_generated_feature[:100]}...")
    
    try:
        print("\n🚀 Sending request to /run-automation-script...")
        response = requests.post("http://localhost:8000/run-automation-script", 
                               json=test_data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Automation request successful!")
            print(f"\n📊 Results Summary:")
            print(f"   Total Tests: {result['summary']['total']}")
            print(f"   Passed: {result['summary']['passed']}")
            print(f"   Failed: {result['summary']['failed']}")
            print(f"   Success Rate: {result['summary']['success_rate']}")
            print(f"   Execution Type: {result.get('executionType', 'unknown')}")
            
            # Check if we got the generated scenarios vs default scenarios
            if result.get('executionType') == 'parsed_karate_scenarios':
                print("\n🎯 SUCCESS: Using parsed Karate scenarios from Section 2!")
                print("   The automation is now processing the generated test cases.")
            elif result.get('executionType') == 'default_scenarios':
                print("\n⚠️  WARNING: Still using default scenarios")
                print("   The generated test cases were not processed correctly.")
            
            print(f"\n📝 Test Scenarios Found:")
            for i, test_result in enumerate(result.get('testResults', []), 1):
                scenario_name = test_result.get('scenario', f'Test {i}')
                status = test_result.get('status', 'Unknown')
                print(f"   {i}. {scenario_name} - {status}")
            
            # Check if we have more than 1 test (which means parsing worked)
            if result['summary']['total'] > 1:
                print(f"\n✅ VERIFICATION PASSED: Found {result['summary']['total']} test cases")
                print("   This confirms the generated test cases from Section 2 are being processed!")
                return True
            else:
                print(f"\n❌ VERIFICATION FAILED: Only {result['summary']['total']} test case found")
                print("   This suggests fallback to default scenarios occurred.")
                return False
                
        else:
            print(f"❌ Request failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def test_without_generated_cases():
    """Test fallback behavior when no generated test cases are provided"""
    print("\n🧪 Testing Fallback Behavior (No Generated Test Cases)")
    print("=" * 60)
    
    test_data = {
        'apiEndpoint': 'https://manage.discovery.aort-eks-1.eks.aort.theplatform.com/rms/957199622/railcollections',
        'method': 'GET',
        # No generatedTestCases field - should trigger fallback
    }
    
    try:
        response = requests.post("http://localhost:8000/run-automation-script", 
                               json=test_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Fallback test successful - Execution Type: {result.get('executionType', 'unknown')}")
            return True
        else:
            print(f"❌ Fallback test failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Fallback test error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing Karate Automation Controls Fix")
    print("This verifies that Section 3 now processes test cases from Section 2")
    print()
    
    # Test 1: With generated test cases
    success1 = test_karate_automation_with_generated_cases()
    
    # Test 2: Fallback behavior
    success2 = test_without_generated_cases()
    
    print(f"\n🏁 Final Results:")
    print(f"   Generated Test Cases Processing: {'✅ PASSED' if success1 else '❌ FAILED'}")
    print(f"   Fallback Behavior: {'✅ PASSED' if success2 else '❌ FAILED'}")
    
    if success1 and success2:
        print(f"\n🎉 ALL TESTS PASSED! The fix is working correctly.")
        print(f"   Section 3 now processes all generated test cases from Section 2!")
    else:
        print(f"\n⚠️  Some tests failed. Check the implementation.")