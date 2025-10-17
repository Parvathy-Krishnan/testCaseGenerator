#!/usr/bin/env python3
"""
Test the fixed generation logic to ensure clean Karate scenarios are produced
without embedded requirement text blocks.
"""

import sys
import os

# Add the current directory to path to import main
sys.path.insert(0, os.getcwd())

from main import generate_mock_test_cases, analyze_requirements

# Sample requirement text similar to user's complex requirement
sample_requirement = """
Feature: GET API Test Cases - Comprehensive Coverage
Generated from requirement analysis

Background:
  * url 'https://manage.discovery.example.com'

Scenario: Functional Requirement Test 1 - Description
Users should be able to Create a feed collection
Summary
User must be able to create and manage (Update/Delete) individual feed collection
This allows grouping of feeds together to display section of a page and reused in multiple pages within an app.
Includes predefine sorting or sort by affinity from recommendation.

Precondition
* User is logged into console via browser
* User is authorised with sufficient permission(s) to perform edit
* User clicked "Create" to create a new feed
* The total number of configured feed collections must not exceed 500

Inputs
Mandatory
* Title (feed collection)
Optional
* Description
* External Reference Id

Outputs
feed collection is stored
* It is displayed in feed collections "overview" tab & "Manage feed collections"
* It is available for selection in Create Feed and Update Feed
* It is persisted in Jump

Validation Rules
* Input data validation on mandatory fields
* Input data validation on External Reference ID
* Validate the total number of configured feed collection(s) has not exceed global limit 300
* throw 403 forbidden in API when attempt to create with exception message

Business Logic
* Back office logic shall handle Creation of LaneGroup object in Jump
* Guid (supplied or generated) is set as id of LaneGroups in JUMP
* Creation of feed collection object and persist in data storage
* Unauthorised operations (admin user with lack of permission) throw 403 forbidden

Exception Handling
If a feed collection fails to create for any reason display exception message accordingly
"""

def test_clean_generation():
    """Test that the fixed generation creates clean scenarios"""
    
    print("🧪 Testing Clean Karate Scenario Generation")
    print("=" * 60)
    
    # Test requirement analysis
    print("\n1. Testing analyze_requirements function:")
    analysis = analyze_requirements(sample_requirement)
    
    print(f"   ✅ Functional requirements: {len(analysis['functional_requirements'])}")
    for req in analysis['functional_requirements']:
        print(f"      - {req}")
    
    print(f"   ✅ Validation points: {len(analysis['validation_points'])}")
    for val in analysis['validation_points']:
        print(f"      - {val}")
        
    print(f"   ✅ Business rules: {len(analysis['business_rules'])}")
    for rule in analysis['business_rules']:
        print(f"      - {rule}")
    
    # Test scenario generation
    print("\n2. Testing generate_mock_test_cases function:")
    api_context = "Endpoint: https://api.example.com/v1/feeds\nMethod: GET"
    
    generated_scenarios = generate_mock_test_cases(sample_requirement, "BOTH", api_context)
    
    print(f"   ✅ Generated {len(generated_scenarios)} characters of test content")
    
    # Validate clean scenarios
    print("\n3. Validating clean scenario structure:")
    
    lines = generated_scenarios.split('\n')
    scenario_lines = [line for line in lines if line.strip().startswith('Scenario:')]
    
    print(f"   ✅ Found {len(scenario_lines)} scenarios:")
    for i, scenario_line in enumerate(scenario_lines, 1):
        print(f"      {i}. {scenario_line.strip()}")
    
    # Check for problematic content
    problematic_indicators = [
        "This allows grouping of feeds",  # Part of embedded requirement text
        "Precondition",
        "Business Logic",  # Headers from requirement doc
        "Exception Handling",
        "User must be able to create and manage",  # Long requirement text
        "Console render main Feed Management screen"  # Detailed steps
    ]
    
    print("\n4. Checking for embedded requirement content:")
    issues_found = 0
    for indicator in problematic_indicators:
        if indicator in generated_scenarios:
            print(f"   ❌ Found embedded requirement content: '{indicator}'")
            issues_found += 1
    
    if issues_found == 0:
        print("   ✅ No embedded requirement content found - scenarios are clean!")
    
    # Show first few scenarios for manual review
    print("\n5. Sample scenarios generated:")
    print("-" * 40)
    scenario_blocks = []
    current_block = []
    in_scenario = False
    
    for line in lines:
        if line.strip().startswith('Scenario:'):
            if current_block:
                scenario_blocks.append('\n'.join(current_block))
            current_block = [line]
            in_scenario = True
        elif in_scenario and line.strip():
            current_block.append(line)
        elif in_scenario and not line.strip():
            if current_block:
                scenario_blocks.append('\n'.join(current_block))
                current_block = []
            in_scenario = False
    
    if current_block:
        scenario_blocks.append('\n'.join(current_block))
    
    for i, block in enumerate(scenario_blocks[:3], 1):  # Show first 3 scenarios
        print(f"\nScenario {i}:")
        print(block)
        print("-" * 40)
    
    print(f"\n🎉 Test completed! Generated {len(scenario_blocks)} total scenarios.")
    
    if issues_found == 0:
        print("✅ SUCCESS: All scenarios are clean and focused!")
        return True
    else:
        print(f"❌ ISSUES FOUND: {issues_found} embedded content problems detected")
        return False

if __name__ == "__main__":
    success = test_clean_generation()
    sys.exit(0 if success else 1)