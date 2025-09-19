package com.example.testcasegenerator;

public class TestRequest {
    public String apiEndpoint;
    public String username;
    public String password;
    public String method;
    public String body;

    // getters and setters
    public String getApiEndpoint() { return apiEndpoint; }
    public void setApiEndpoint(String apiEndpoint) { this.apiEndpoint = apiEndpoint; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}