#!/usr/bin/env python3
"""
Test script to validate the enhanced Karate feature parser functionality
"""

def parse_karate_feature_to_test_cases(feature_content: str) -> list:
    """
    Parse raw Karate feature file content into structured test case objects
    that the backend can process for automation execution.
    Enhanced to handle complex scenarios with mixed content.
    """
    test_cases = []
    lines = feature_content.split('\n')
    current_scenario = None
    current_steps = []
    current_comments = []
    in_scenario = False
    
    print(f">>> Parsing Karate feature with {len(lines)} lines")
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Detect scenario start (handle both "Scenario:" and "Scenario Outline:")
        if line.startswith('Scenario:') or line.startswith('Scenario Outline:'):
            # Save previous scenario if exists
            if current_scenario and current_steps:
                test_case = create_test_case_from_scenario(current_scenario, current_steps, current_comments)
                if test_case:
                    test_cases.append(test_case)
                    print(f">>> Added scenario: {current_scenario[:50]}...")
            
            # Start new scenario
            scenario_line = line.replace('Scenario:', '').replace('Scenario Outline:', '').strip()
            current_scenario = scenario_line
            current_steps = []
            current_comments = []
            in_scenario = True
            print(f">>> Found new scenario: {scenario_line[:50]}...")
            
        # Collect comments (requirement links) - only within scenarios
        elif in_scenario and line.startswith('#'):
            current_comments.append(line[1:].strip())
            
        # Collect scenario steps - the main test logic
        elif in_scenario and line.startswith(('Given', 'When', 'Then', 'And', '*')):
            current_steps.append(line)
            print(f">>> Added step: {line[:50]}...")
            
        # Look for Background section steps (applies to all scenarios)
        elif line.startswith(('Given', 'When', 'Then', 'And', '*')) and not in_scenario:
            # These are background steps that apply to all scenarios
            # We'll handle them separately if needed
            pass
            
        i += 1
    
    # Don't forget the last scenario
    if current_scenario and current_steps:
        test_case = create_test_case_from_scenario(current_scenario, current_steps, current_comments)
        if test_case:
            test_cases.append(test_case)
            print(f">>> Added final scenario: {current_scenario[:50]}...")
    
    print(f">>> Successfully parsed {len(test_cases)} test scenarios from Karate feature file")
    return test_cases


def create_test_case_from_scenario(scenario_name: str, steps: list, comments: list) -> dict:
    """
    Convert a parsed scenario into a structured test case object
    """
    if not steps:
        print(f">>> Warning: No steps found for scenario '{scenario_name}'")
        return None
        
    return {
        "scenario": scenario_name,
        "steps": steps,
        "comments": comments,
        "method": extract_method_from_steps(steps),
        "url": extract_url_from_steps(steps),
        "expected_status": extract_status_from_steps(steps)
    }


def extract_method_from_steps(steps: list) -> str:
    """Extract HTTP method from Karate steps"""
    for step in steps:
        if "method" in step.lower():
            if "get" in step.lower():
                return "GET"
            elif "post" in step.lower():
                return "POST"
            elif "put" in step.lower():
                return "PUT"
            elif "delete" in step.lower():
                return "DELETE"
    return "GET"  # default


def extract_url_from_steps(steps: list) -> str:
    """Extract URL from Karate steps"""
    for step in steps:
        if "url" in step.lower() and ("http" in step.lower() or "https" in step.lower()):
            # Extract URL from quotes
            if '"' in step:
                parts = step.split('"')
                for part in parts:
                    if "http" in part:
                        return part
    return ""


def extract_status_from_steps(steps: list) -> int:
    """Extract expected status code from Karate steps"""
    for step in steps:
        if "status" in step.lower():
            # Extract number from step
            import re
            numbers = re.findall(r'\d+', step)
            if numbers:
                return int(numbers[0])
    return 200  # default


def test_simple_feature():
    """Test with a simple Karate feature"""
    print("\n=== Testing Simple Feature ===")
    simple_feature = """Feature: Simple API Testing

Scenario: Test GET request
  # Simple GET test
  Given url "http://httpbin.org/get"
  When method get
  Then status 200

Scenario: Test POST request
  # Simple POST test
  Given url "http://httpbin.org/post"
  And request {"name": "test"}
  When method post
  Then status 200
"""
    
    results = parse_karate_feature_to_test_cases(simple_feature)
    print(f"\nResults: Found {len(results)} scenarios")
    for i, result in enumerate(results, 1):
        print(f"  {i}. {result['scenario']} - {result['method']} {result['url']} -> {result['expected_status']}")
    
    return len(results) == 2


def test_complex_feature():
    """Test with a complex Karate feature that has mixed content"""
    print("\n=== Testing Complex Feature ===")
    complex_feature = """Feature: Complex API Testing with Requirements

Background:
  * url 'http://localhost:8080'

Scenario: Complex GET with Requirements
  # REQ-001: System shall support GET operations
  # This scenario tests the basic GET functionality
  # with various validation requirements including:
  # - Response time validation
  # - Content type verification  
  # - Status code confirmation
  
  Some additional requirement text here that explains
  the business logic and validation rules that apply
  to this specific test scenario.
  
  Given url "http://httpbin.org/get"
  And header Accept = "application/json"
  When method get
  Then status 200
  And match response.headers contains {"Content-Type": "#string"}

Scenario Outline: Data-driven POST test
  # REQ-002: System shall handle multiple data formats
  # This test validates POST operations with different
  # input data structures and formats
  
  Complex requirement description that spans multiple
  lines and includes detailed validation criteria,
  error handling requirements, and edge cases.
  
  Given url "http://httpbin.org/post"  
  And request {"name": "<name>", "age": <age>}
  When method post
  Then status 200
  And match response.json.name == "<name>"
  
  Examples:
    | name  | age |
    | John  | 30  |
    | Jane  | 25  |

Scenario: Complex validation with mixed content
  # REQ-003: Advanced validation requirements
  
  This scenario includes extensive requirement documentation
  that explains the complex validation logic, including:
  
  1. Input validation rules
  2. Output format requirements  
  3. Error handling specifications
  4. Performance criteria
  5. Security considerations
  
  Additional paragraphs of requirement text that would
  typically be found in complex enterprise test scenarios
  where business requirements are embedded directly
  in the test specification.
  
  Given url "http://httpbin.org/put"
  And request {"data": "complex test"}
  When method put
  Then status 200
  And assert response.time < 1000
"""
    
    results = parse_karate_feature_to_test_cases(complex_feature)
    print(f"\nResults: Found {len(results)} scenarios")
    for i, result in enumerate(results, 1):
        print(f"  {i}. {result['scenario'][:50]}... - {result['method']} {result['url']} -> {result['expected_status']}")
        print(f"      Steps: {len(result['steps'])}, Comments: {len(result['comments'])}")
    
    return len(results) == 3


def main():
    """Run all parser tests"""
    print("Testing Enhanced Karate Feature Parser")
    print("=====================================")
    
    test1_passed = test_simple_feature()
    test2_passed = test_complex_feature()
    
    print(f"\n=== Test Results ===")
    print(f"Simple Feature Test: {'PASSED' if test1_passed else 'FAILED'}")
    print(f"Complex Feature Test: {'PASSED' if test2_passed else 'FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n✅ All tests PASSED! The enhanced parser is working correctly.")
    else:
        print("\n❌ Some tests FAILED! Parser needs further debugging.")


if __name__ == "__main__":
    main()