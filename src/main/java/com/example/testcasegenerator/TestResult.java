package com.example.testcasegenerator;

public class TestResult {
    public int statusCode;
    public String responseBody;
    public TestResult(int statusCode, String responseBody) {
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
    public int getStatusCode() { return statusCode; }
    public String getResponseBody() { return responseBody; }
}