package com.example.testcasegenerator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@CrossOrigin(origins = "*")
@RestController
public class RestAssuredTestController {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostMapping("/run-rest-assured")
    public ResponseEntity<TestResult> runTest(@RequestBody TestRequest request) {
        try {
            // Validate required fields
            if (request.getApiEndpoint() == null || request.getApiEndpoint().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new TestResult(400, "API endpoint is required")
                );
            }

            RequestSpecification requestSpec = RestAssured.given()
                    .relaxedHTTPSValidation() // For testing purposes
                    .log().all(); // Log all request details

            // Add authentication if provided
            if (request.getUsername() != null && !request.getUsername().trim().isEmpty() &&
                request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                requestSpec.auth().basic(request.getUsername(), request.getPassword());
            }

            // Add request body if provided
            if (request.getBody() != null && !request.getBody().trim().isEmpty()) {
                try {
                    // Validate JSON format
                    objectMapper.readTree(request.getBody());
                    requestSpec.contentType(ContentType.JSON).body(request.getBody());
                } catch (Exception e) {
                    // If not valid JSON, send as plain text
                    requestSpec.contentType(ContentType.TEXT).body(request.getBody());
                }
            }

            Response response;
            String method = request.getMethod() != null ? request.getMethod().toUpperCase() : "GET";

            // Execute request based on HTTP method
            switch (method) {
                case "POST":
                    response = requestSpec.when().post(request.getApiEndpoint());
                    break;
                case "PUT":
                    response = requestSpec.when().put(request.getApiEndpoint());
                    break;
                case "DELETE":
                    response = requestSpec.when().delete(request.getApiEndpoint());
                    break;
                case "PATCH":
                    response = requestSpec.when().patch(request.getApiEndpoint());
                    break;
                case "GET":
                default:
                    response = requestSpec.when().get(request.getApiEndpoint());
                    break;
            }

            // Log response details
            response.then().log().all();

            // Format response body for better readability
            String responseBody;
            try {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody().asString());
                responseBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonResponse);
            } catch (Exception e) {
                responseBody = response.getBody().asString();
            }

            TestResult result = new TestResult(response.getStatusCode(), responseBody);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new TestResult(500, "Test execution failed: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/generate-rest-assured-code")
    public ResponseEntity<String> generateRestAssuredCode(@RequestParam TestRequest request) {
        try {
            StringBuilder code = new StringBuilder();
            
            code.append("import io.restassured.RestAssured;\n");
            code.append("import io.restassured.http.ContentType;\n");
            code.append("import org.junit.Test;\n");
            code.append("import static io.restassured.RestAssured.*;\n");
            code.append("import static org.hamcrest.Matchers.*;\n\n");
            
            code.append("@Test\n");
            code.append("public void test").append(request.getMethod() != null ? request.getMethod().toUpperCase() : "GET").append("Request() {\n");
            code.append("    RestAssured.baseURI = \"").append(request.getApiEndpoint()).append("\";\n\n");
            
            code.append("    given()\n");
            
            if (request.getUsername() != null && !request.getUsername().trim().isEmpty() &&
                request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                code.append("        .auth().basic(\"").append(request.getUsername()).append("\", \"").append(request.getPassword()).append("\")\n");
            }
            
            if (request.getBody() != null && !request.getBody().trim().isEmpty()) {
                code.append("        .contentType(ContentType.JSON)\n");
                code.append("        .body(\"").append(request.getBody().replace("\"", "\\\"")).append("\")\n");
            }
            
            code.append("    .when()\n");
            code.append("        .").append(request.getMethod() != null ? request.getMethod().toLowerCase() : "get").append("()\n");
            code.append("    .then()\n");
            code.append("        .statusCode(200)\n");
            code.append("        .log().all();\n");
            code.append("}");
            
            return ResponseEntity.ok(code.toString());
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Code generation failed: " + e.getMessage());
        }
    }
}
