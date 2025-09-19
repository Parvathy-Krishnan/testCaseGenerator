package com.example.testcasegenerator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

@CrossOrigin(origins = "*")
@RestController
public class RestAssuredTestController {
    @PostMapping("/run-rest-assured")
    public ResponseEntity<TestResult> runTest(@RequestBody TestRequest request) {
        RequestSpecification requestSpec = RestAssured.given()
                .auth().basic(request.getUsername(), request.getPassword());

        if (request.getBody() != null && !request.getBody().trim().isEmpty()) {
            requestSpec.contentType(ContentType.JSON).body(request.getBody());
        }

        Response response;
        String method = request.getMethod() != null ? request.getMethod().toUpperCase() : "GET";

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
            case "GET":
            default:
                response = requestSpec.when().get(request.getApiEndpoint());
                break;
        }

        TestResult result = new TestResult(response.getStatusCode(), response.getBody().asString());
        return ResponseEntity.ok(result);
    }
}
