class KarateTestGenerator {
    constructor() {
        this.apiStatus = null;
        
        // Add safety checks for DOM elements
        const authTypeEl = document.getElementById('authType');
        if (authTypeEl) {
            authTypeEl.addEventListener('change', () => this.toggleAuthFields());
        }
        
        const methodEl = document.getElementById('apiMethod');
        if (methodEl) {
            methodEl.addEventListener('change', () => this.handleMethodChange());
        }
        
        const testFormEl = document.getElementById('testForm');
        if (testFormEl) {
            testFormEl.addEventListener('submit', (e) => this.generateTestCases(e));
        }
        
        // Initialize field visibility on page load
        this.toggleAuthFields();
        this.handleMethodChange();
        
        // Input method toggle
        document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleInputMethod());
        });
        
        // Additional event listeners with safety checks
        const runKarateBtnEl = document.getElementById('runKarateBtn');
        if (runKarateBtnEl) {
            runKarateBtnEl.addEventListener('click', () => this.runKarateAutomation());
        }
        
        const downloadReportBtnEl = document.getElementById('downloadReportBtn');
        if (downloadReportBtnEl) {
            downloadReportBtnEl.addEventListener('click', () => this.downloadAutomationReport());
        }
        
        // Copy buttons with safety checks
        const copyTestCasesBtnEl = document.getElementById('copyTestCasesBtn');
        if (copyTestCasesBtnEl) {
            copyTestCasesBtnEl.addEventListener('click', () => this.copyTestCases());
        }
        
        const copyFeatureBtnEl = document.getElementById('copyFeatureBtn');
        if (copyFeatureBtnEl) {
            copyFeatureBtnEl.addEventListener('click', () => this.copyFeatureFile());
        }
        
        const copyResponseBtnEl = document.getElementById('copyResponseBtn');
        if (copyResponseBtnEl) {
            copyResponseBtnEl.addEventListener('click', () => this.copyResponse());
        }
        
        const copyRequestBtnEl = document.getElementById('copyRequestBtn');
        if (copyRequestBtnEl) {
            copyRequestBtnEl.addEventListener('click', () => this.copyRequest());
        }
        
        const copyAllScriptsBtnEl = document.getElementById('copyAllScriptsBtn');
        if (copyAllScriptsBtnEl) {
            copyAllScriptsBtnEl.addEventListener('click', () => this.copyAllScripts());
        }
        
        // Download buttons with safety checks
        const downloadTestCasesBtnEl = document.getElementById('downloadTestCasesBtn');
        if (downloadTestCasesBtnEl) {
            downloadTestCasesBtnEl.addEventListener('click', () => this.downloadFeatureFile());
        }
        
        const downloadScriptBtnEl = document.getElementById('downloadScriptBtn');
        if (downloadScriptBtnEl) {
            downloadScriptBtnEl.addEventListener('click', () => this.downloadAllScripts());
        }
        
        const clearResultsBtnEl = document.getElementById('clearResultsBtn');
        if (clearResultsBtnEl) {
            clearResultsBtnEl.addEventListener('click', () => this.clearResults());
        }
        
        // Initialize roadmap
        this.initializeRoadmap();
        // Add keyboard navigation for roadmap
        this.initializeKeyboardNavigation();
        this.currentResults = null;

        // Check API status on page load
        this.checkApiStatus();
    }    async checkApiStatus() {
        try {
            console.log('Checking API status...');
            const response = await fetch('/api-status');
            this.apiStatus = await response.json();
            this.displayApiStatusNotification();
        } catch (error) {
            console.error('Failed to check API status:', error);
            this.showAlert('Unable to check API status. Using local generation.', 'warning');
        }
    }

    displayApiStatusNotification() {
        if (!this.apiStatus) return;

        const { openai, primary_method } = this.apiStatus;
        
        // Create or update status notification
        let statusElement = document.getElementById('apiStatusNotification');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'apiStatusNotification';
            statusElement.className = 'alert mb-3';
            
            // Insert after the header banner
            const headerBanner = document.querySelector('.header-banner');
            if (headerBanner) {
                headerBanner.insertAdjacentElement('afterend', statusElement);
            }
        }

        let alertClass = 'alert-info';
        let icon = 'bi-info-circle';
        let message = '';

        if (openai.status === 'active') {
            alertClass = 'alert-warning';
            icon = 'bi-exclamation-triangle';
            
            // Check for token warning in the response
            if (this.apiStatus.token_warning) {
                message = `<strong>⚠️ Token Status Warning:</strong> ${this.apiStatus.token_warning}<br>
                          <small>OpenAI API configured but may be expired. System automatically using reliable backup: ${primary_method}</small>`;
            } else {
                message = `<strong>✅ AI Generation Ready:</strong> Using ${primary_method} for enhanced test case generation.`;
                alertClass = 'alert-success';
                icon = 'bi-check-circle';
            }
        } else if (openai.status === 'inactive') {
            alertClass = 'alert-warning';
            icon = 'bi-exclamation-triangle';
            message = `<strong>⚠️ OpenAI API Inactive:</strong> ${openai.message}<br>
                      <small>Using ${primary_method} with comprehensive requirement analysis for reliable test generation.</small>`;
        } else if (openai.status === 'quota_exceeded') {
            alertClass = 'alert-warning';
            icon = 'bi-exclamation-triangle';
            message = `<strong>⚠️ OpenAI Quota Exceeded:</strong> ${openai.message}<br>
                      <small>Using ${primary_method} with comprehensive requirement analysis.</small>`;
        } else if (openai.status === 'error') {
            alertClass = 'alert-warning';
            icon = 'bi-exclamation-triangle';
            message = `<strong>⚠️ OpenAI API Error:</strong> ${openai.message}<br>
                      <small>Using ${primary_method} with comprehensive requirement analysis.</small>`;
        } else {
            alertClass = 'alert-info';
            icon = 'bi-info-circle';
            message = `<strong>ℹ️ Local Generation Active:</strong> Using ${primary_method} with comprehensive requirement analysis.`;
        }

        statusElement.className = `alert ${alertClass} mb-3`;
        statusElement.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${icon} me-2"></i>
                <div>${message}</div>
            </div>
        `;
    }

    // Show/hide auth fields based on selection
    toggleAuthFields() {
        const authType = document.getElementById('authType');
        const tokenSection = document.getElementById('tokenSection');
        const basicAuthSection = document.getElementById('basicAuthSection');
        
        if (!authType || !tokenSection || !basicAuthSection) return;
        
        const authValue = authType.value;
        
        // Hide all sections first
        tokenSection.style.display = 'none';
        basicAuthSection.style.display = 'none';
        
        // Show appropriate section based on auth type
        if (authValue === 'basic') {
            basicAuthSection.style.display = 'block';
        } else if (authValue === 'bearer') { // Base64 option
            tokenSection.style.display = 'block';
        }
        // For 'none' and 'oauth', show neither section
    }

    initializeKeyboardNavigation() {
        // Handle keyboard navigation for roadmap steps
        const roadmapSteps = document.querySelectorAll('.roadmap-step');
        roadmapSteps.forEach((step, index) => {
            step.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Scroll to corresponding section
                    this.scrollToSection(index + 1);
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextStep = roadmapSteps[index + 1];
                    if (nextStep) nextStep.focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevStep = roadmapSteps[index - 1];
                    if (prevStep) prevStep.focus();
                }
            });
        });
        
        // Add escape key handler for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    const closeButton = modal.querySelector('.btn-close');
                    if (closeButton) closeButton.click();
                }
            }
        });
    }
    
    scrollToSection(sectionNumber) {
        let targetId = '';
        switch (sectionNumber) {
            case 1:
                targetId = 'testForm';
                break;
            case 2:
                targetId = 'testCasesSection';
                break;
            case 3:
                targetId = 'automationSection';
                break;
        }
        
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            // Set focus to the section for screen readers
            targetElement.focus();
        }
    }

    toggleInputMethod() {
        const textInput = document.getElementById('textInput').checked;
        const textSection = document.getElementById('textInputSection');
        const fileSection = document.getElementById('fileInputSection');
        
        if (textInput) {
            textSection.style.display = 'block';
            fileSection.style.display = 'none';
        } else {
            textSection.style.display = 'none';
            fileSection.style.display = 'block';
        }
        
        // Progress step 1 when user selects an input method
        this.updateRoadmapStep(1, 'active');
        this.announceToScreenReader(`Step 1 activated: ${textInput ? 'Text input' : 'File upload'} method selected.`);
    }

    handleMethodChange() {
        const method = document.getElementById('apiMethod').value;
        const payloadSection = document.getElementById('payloadSection');
        const idSection = document.getElementById('idSection');
        const customHeadersSection = document.getElementById('customHeadersSection');
        const payloadLabel = document.getElementById('payloadLabel');

        // Hide all sections first
        payloadSection.style.display = 'none';
        idSection.style.display = 'none';
        customHeadersSection.style.display = 'none';

        // Show appropriate section based on method
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            payloadSection.style.display = 'block';
            // Update label for POST/PUT methods
            if (payloadLabel) {
                payloadLabel.textContent = method === 'POST' ? 'POST Payload (JSON)' : 
                                         method === 'PUT' ? 'PUT Payload (JSON)' : 
                                         'PATCH Payload (JSON)';
            }
        } 
        // Show ID section for DELETE
        else if (method === 'DELETE') {
            idSection.style.display = 'block';
        } 
        // Show custom headers for GET (and other methods that don't need payload/ID)
        else if (method === 'GET') {
            customHeadersSection.style.display = 'block';
        }
    }

    async generateTestCases(e) {
        e.preventDefault();

        // Validate input first, then reset UI only if valid
        const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;
        if (inputMethod === 'text') {
            const requirement = document.getElementById('requirement').value.trim();
            if (!requirement) {
                this.updateRoadmapStep(1, 'error');
                this.updateRoadmapStep(2, 'not-started');
                this.showAlert('Please enter a requirement', 'warning');
                this.hideLoading();
                return;
            }
        } else {
            const fileInput = document.getElementById('requirementFile');
            if (!fileInput.files.length) {
                this.updateRoadmapStep(1, 'error');
                this.updateRoadmapStep(2, 'not-started');
                this.showAlert('Please select a file', 'warning');
                this.hideLoading();
                return;
            }
        }

        // Check API status before generation
        console.log('Checking API status before generation...');
        await this.checkApiStatus();

        // Update roadmap
        this.updateRoadmapStep(1, 'completed');
        this.updateRoadmapStep(2, 'active');

    this.showLoading('Analyzing requirements and generating test cases...', 'Generating Test Cases');
    // ...existing code...

    try {
        const formData = new FormData();
            const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;

            if (inputMethod === 'text') {
                const requirement = document.getElementById('requirement').value.trim();
                if (!requirement) {
                    this.updateRoadmapStep(1, 'error');
                    this.updateRoadmapStep(2, 'not-started');
                    this.showAlert('Please enter a requirement', 'warning');
                    this.hideLoading();
                    return;
                }
                formData.append('requirement', requirement);
            } else {
                const fileInput = document.getElementById('requirementFile');
                if (!fileInput.files.length) {
                    this.updateRoadmapStep(1, 'error');
                    this.updateRoadmapStep(2, 'not-started');
                    this.showAlert('Please select a file', 'warning');
                    this.hideLoading();
                    return;
                }
                formData.append('file', fileInput.files[0]);
            }

            // Add other form data
            formData.append('apiEndpoint', document.getElementById('apiEndpoint').value || '');
            formData.append('apiMethod', document.getElementById('apiMethod').value);
            const authType = document.getElementById('authType').value;
            formData.append('authType', authType);
            
            // Handle different authentication types
            if (authType === 'basic') {
                formData.append('username', document.getElementById('username').value || '');
                formData.append('password', document.getElementById('password').value || '');
            } else if (['bearer', 'oauth', 'apikey', 'jwt'].includes(authType)) {
                formData.append('token', document.getElementById('token').value || '');
            }
            
            formData.append('payload', document.getElementById('payload').value || '');
            formData.append('resourceId', document.getElementById('resourceId').value || '');
            formData.append('acceptHeader', document.getElementById('acceptHeader').value || '');
            formData.append('customHeaders', document.getElementById('customHeaders').value || '');
            
            // Always send 'operation', default to 'Test' if not set
            const operationValue = document.getElementById('operation')?.value || 'Test';
            formData.append('operation', operationValue);

            const response = await fetch('/generate-test-cases', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Reset UI and state only after successful generation
                this.resetWorkflowUI();
                this.displayTestCases(data.output || data.test_cases);
                this.showAlert('Karate test cases generated successfully!', 'success');
            } else {
                this.updateRoadmapStep(2, 'error');
                throw new Error(data.error || 'Failed to generate test cases');
            }
        } catch (error) {
            this.updateRoadmapStep(2, 'error');
            let errorMsg = `Error: ${error.message}`;
            if (error.stack) {
                errorMsg += `<br><pre style='white-space:pre-wrap;'>${error.stack}</pre>`;
            }
            this.showAlert(errorMsg, 'danger');
            // Log error to console for debugging
            console.error('Generate Karate Test Cases Error:', error);
        } finally {
            this.hideLoading();
        }
    }

    displayTestCases(testCases) {
        // Count the number of test scenarios - handle both "Scenario:" and "Scenario N:" patterns
        const scenarioMatches = testCases.match(/Scenario(\s+\d+)?:/g) || [];
        const scenarioCount = scenarioMatches.length;
        
        console.log('Test case counter debug:', {
            scenarioMatches: scenarioMatches,
            scenarioCount: scenarioCount,
            testCasesLength: testCases.length
        });

        // Update test case count
        document.getElementById('testCaseCountNumber').textContent = scenarioCount;

        // Show Section 2: Generated Test Cases
        const section = document.getElementById('testCasesSection');
        const content = document.getElementById('testCasesContent');

        section.style.display = 'block';
        // Display as .feature file format directly
        content.innerHTML = `<pre class="bg-light p-3 rounded border" style="max-height: 500px; overflow-y: auto;">${testCases}</pre>`;

        // Also update the feature file content for consistency
        const featureFileContent = document.getElementById('featureFileContent');
        if (featureFileContent) {
            featureFileContent.textContent = testCases;
        }

        // Show Section 3: Automation Controls
        document.getElementById('automationSection').style.display = 'block';

        // Update roadmap
        this.updateRoadmapStep(1, 'completed');
        this.updateRoadmapStep(2, 'completed');
        this.updateRoadmapStep(3, 'active');

        // Store test cases for copying/downloading
        this.currentTestCases = testCases;

        // Scroll to test cases section
        section.scrollIntoView({ behavior: 'smooth' });
    }

    async runKarateAutomation() {
        this.showLoading('Executing test scenarios and generating comprehensive results...', 'Running Karate Automation');
        
        try {
            const authType = document.getElementById('authType').value;
            const requestData = {
                apiEndpoint: document.getElementById('apiEndpoint').value,
                method: document.getElementById('apiMethod').value,
                body: document.getElementById('payload').value || '',
                resourceId: document.getElementById('resourceId').value || '',
                acceptHeader: document.getElementById('acceptHeader').value || ''
            };

            // Only add authentication fields based on auth type
            if (authType === 'basic') {
                requestData.username = document.getElementById('username').value || '';
                requestData.password = document.getElementById('password').value || '';
            } else if (authType === 'token') {
                requestData.token = document.getElementById('token').value || '';
            }

            // CRITICAL FIX: Include the generated test cases from Section 2
            if (this.currentTestCases) {
                console.log('Including generated test cases from Section 2:', this.currentTestCases.substring(0, 200) + '...');
                requestData.generatedTestCases = [this.currentTestCases]; // Pass as array of raw Karate content
            } else {
                console.log('No generated test cases found - will use default scenarios');
                // Warn user that they should generate test cases first for better results
                const shouldContinue = confirm(
                    'No test cases have been generated yet. For best results:\n\n' +
                    '1. Fill in the requirement details in Section 1\n' +
                    '2. Click "Generate Test Cases" to create comprehensive scenarios\n' +
                    '3. Then run automation to execute those scenarios\n\n' +
                    'Continue with basic default scenarios instead?'
                );
                if (!shouldContinue) {
                    this.hideLoading();
                    return;
                }
            }

            // Store form data for later use in request display
            this.lastFormData = { ...requestData };

            console.log('Sending automation request with generated test cases:', {
                ...requestData,
                generatedTestCases: requestData.generatedTestCases ? '[INCLUDED]' : 'Not included'
            });

            const response = await fetch('/run-automation-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                this.displayResults(data);
                this.showAlert(`Automation completed: ${data.summary.passed}/${data.summary.total} tests passed`, 
                    data.summary.failed === 0 ? 'success' : 'warning');
            } else {
                throw new Error(data.detail || 'Failed to run automation');
            }
        } catch (error) {
            this.showAlert(`Error: ${error.message}`, 'danger');
        } finally {
            this.hideLoading();
        }
    }

    displayResults(results) {
        this.currentResults = results;
        
        // Show Results Container in Section 3
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.style.display = 'block';

        // Update summary
        document.getElementById('totalTests').textContent = results.summary.total;
        document.getElementById('passedTests').textContent = results.summary.passed;
        document.getElementById('failedTests').textContent = results.summary.failed;
        document.getElementById('successRate').textContent = results.summary.success_rate;

        // Update results table
        const tbody = document.getElementById('testResultsBody');
        tbody.innerHTML = '';

        results.testResults.forEach((test, index) => {
            const row = document.createElement('tr');
            const statusClass = test.status === 'PASSED' ? 'text-success' : 'text-danger';
            const statusIcon = test.status === 'PASSED' ? 'check-circle-fill' : 'x-circle-fill';

            // Add CSS classes for filtering
            row.classList.add('test-result-row');
            row.classList.add(test.status === 'PASSED' ? 'result-passed' : 'result-failed');

            // Determine expected status code based on test scenario
            const expectedCode = this.getExpectedStatusCode(test.scenario);

            // Enable the view button if either response or details exist
            const canView = test.response || test.details;
            row.innerHTML = `
                <td>${test.scenario}</td>
                <td>
                    <span class="${statusClass}">
                        <i class="bi bi-${statusIcon}"></i>
                        ${test.status}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getStatusCodeClass(test.statusCode)}">${test.statusCode}</span>
                </td>
                <td>
                    <span class="badge ${this.getStatusCodeClass(expectedCode)}">${expectedCode}</span>
                </td>
                <td>
                    <small>${test.details}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="karateGenerator.showResponse(${index})" 
                            ${!canView ? 'disabled' : ''} aria-label="View response log for ${test.scenario}">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Repurpose feature file section to show test log summary
        const featureFileContent = document.getElementById('featureFileContent');
        if (featureFileContent) {
            let summaryHtml = '';
            summaryHtml += `Test Log Summary\n`;
            summaryHtml += `Total Tests: ${results.summary.total}\n`;
            summaryHtml += `Passed: ${results.summary.passed}\n`;
            summaryHtml += `Failed: ${results.summary.failed}\n`;
            summaryHtml += `Success Rate: ${results.summary.success_rate}\n\n`;
            results.testResults.forEach((test, idx) => {
                summaryHtml += `Scenario ${idx + 1}: ${test.scenario}\n`;
                summaryHtml += `Request: ${test.request ? JSON.stringify(test.request, null, 2) : 'N/A'}\n`;
                summaryHtml += `Response: ${test.response ? test.response : 'No response available.'}\n`;
                summaryHtml += `Status Code: ${test.statusCode}\n`;
                summaryHtml += `Details: ${test.details}\n\n`;
            });
            featureFileContent.textContent = summaryHtml;
        }

        // Update roadmap
        this.updateRoadmapStep(3, 'completed');

        // Show download button
        document.getElementById('downloadReportBtn').style.display = 'inline-block';

        // Initialize filter to show all results
        this.filterResults('all');
        
        // Add keyboard accessibility for filter tiles
        this.setupFilterKeyboardNavigation();

        // Scroll to results
        document.getElementById('automationSection').scrollIntoView({ behavior: 'smooth' });
    }

    async downloadAutomationReport() {
        const btn = document.getElementById('downloadReportBtn');
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Generating Report...';
            
            // Show loading modal for report generation
            this.showLoading('Creating comprehensive automation report...', 'Generating Report');
            
            // Get form data
            const formData = this.getFormData();
            
            // Make request to download endpoint
            const response = await fetch('/download-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get filename from response header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'automation_report.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message
            this.showAlert('Report downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showAlert(`Failed to download report: ${error.message}`, 'danger');
        } finally {
            this.hideLoading();
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    getFormData() {
        // Get authentication type
        const authType = document.getElementById('authType').value;
        
        return {
            apiEndpoint: document.getElementById('apiEndpoint').value || '',
            method: document.getElementById('apiMethod').value,
            username: authType === 'basic' ? (document.getElementById('username').value || '') : '',
            password: authType === 'basic' ? (document.getElementById('password').value || '') : '',
            token: authType === 'token' ? (document.getElementById('token').value || '') : '',
            body: document.getElementById('payload').value || '',
            resourceId: document.getElementById('resourceId').value || '',
            acceptHeader: document.getElementById('acceptHeader').value || ''
        };
    }

    showResponse(index) {
        if (!this.currentResults || !this.currentResults.testResults[index]) return;

        const test = this.currentResults.testResults[index];
        const modalEl = document.getElementById('responseModal');
        const modal = new bootstrap.Modal(modalEl);

        // Log the response to the console for debugging
        console.log('Test Response Log:', {
            scenario: test.scenario,
            statusCode: test.statusCode,
            response: test.response,
            details: test.details
        });

        // Parse request and response from the combined response text
        let requestInfo = '';
        let responseInfo = '';
        
        if (test.response && test.response.includes('=== REQUEST DETAILS ===')) {
            // Split the combined response
            const parts = test.response.split('=== RESPONSE ===');
            if (parts.length >= 2) {
                requestInfo = parts[0].replace('=== REQUEST DETAILS ===', '').replace('========================', '').trim();
                responseInfo = parts[1].replace('===============', '').trim();
            }
        } else {
            // For cases without combined format, try to extract available info
            const formData = this.getStoredFormData();
            requestInfo = `Method: ${formData?.apiMethod || 'GET'}
Endpoint: ${formData?.apiEndpoint || 'Not available'}
Accept Header: ${formData?.acceptHeader || 'Not specified'}
Authentication: ${formData?.token ? 'Bearer Token' : (formData?.username ? 'Basic Auth' : 'None')}
Request Body: ${formData?.body || 'None'}`;
            responseInfo = test.response || 'No response available';
        }

        // Display the title and populate test scenario section - with null checks
        const responseModalTitle = document.getElementById('responseModalTitle');
        if (responseModalTitle) {
            responseModalTitle.textContent = `${test.scenario} - Request & Response Details`;
        } else {
            console.warn('responseModalTitle element not found');
        }
        
        // Populate Test Scenario Section
        const testScenarioName = document.getElementById('testScenarioName');
        if (testScenarioName) {
            testScenarioName.textContent = test.scenario;
        } else {
            console.warn('testScenarioName element not found');
        }
        
        const testScenarioContent = document.getElementById('testScenarioContent');
        if (testScenarioContent) {
            testScenarioContent.innerHTML = `
                <div class="mb-3">
                    <strong class="text-info d-flex align-items-center">
                        <i class="bi bi-info-circle me-2"></i>Scenario Description:
                    </strong>
                    <div class="mt-2 p-3 bg-info bg-opacity-10 rounded border border-info">
                        ${test.details || 'No description available'}
                    </div>
                </div>

                <div class="mb-3">
                    <strong class="text-warning d-flex align-items-center">
                        <i class="bi bi-code-slash me-2"></i>Generated Karate Test Script:
                    </strong>
                    <div class="mt-2">
                        <pre class="bg-dark text-light p-3 rounded border" style="font-size: 0.85em; overflow-x: auto; max-height: 300px; overflow-y: auto;">${this.formatKarateTestCase(test)}</pre>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="navigator.clipboard.writeText(\`${this.formatKarateTestCase(test).replace(/`/g, '\\`')}\`)">
                                <i class="bi bi-clipboard"></i> Copy Test Script
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mb-2">
                    <strong class="text-secondary d-flex align-items-center">
                        <i class="bi bi-gear me-2"></i>Test Purpose:
                    </strong>
                    <div class="mt-2 p-2 bg-light rounded border">
                        <small class="text-muted">
                            This test validates: ${this.getTestPurpose(test.scenario)}
                        </small>
                    </div>
                </div>
            `;
        } else {
            console.warn('testScenarioContent element not found');
        }
        
        // Handle collapse icon rotation
        this.setupCollapseBehavior();
        
        // Populate Request Container
        const requestModalContent = document.getElementById('requestModalContent');
        if (requestModalContent) {
            requestModalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <strong class="text-primary d-flex align-items-center">
                            <i class="bi bi-arrow-up-circle me-2"></i>HTTP Method & Endpoint:
                        </strong>
                        <div class="mt-2 p-2 bg-primary bg-opacity-10 rounded border border-primary">
                            <div class="d-flex align-items-center">
                                <span class="badge bg-primary me-2">${this.getStoredFormData()?.apiMethod || 'GET'}</span>
                                <small class="text-muted text-break">${this.getStoredFormData()?.apiEndpoint || 'Endpoint not available'}</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <strong class="text-info d-flex align-items-center">
                            <i class="bi bi-key me-2"></i>Authentication:
                        </strong>
                        <div class="mt-2 p-2 bg-info bg-opacity-10 rounded border border-info">
                            <small class="text-muted">
                                ${this.getStoredFormData()?.token ? 'Bearer Token' : 
                                  this.getStoredFormData()?.username ? 'Basic Auth' : 'None'}
                            </small>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <strong class="text-primary d-flex align-items-center">
                        <i class="bi bi-file-text me-2"></i>Full Request Details:
                    </strong>
                    <pre class="bg-white p-3 mt-2 rounded border" style="max-height: 300px; overflow-y: auto; font-size: 0.85em;">${requestInfo}</pre>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText(\`${requestInfo.replace(/`/g, '\\`')}\`)">
                            <i class="bi bi-clipboard"></i> Copy Request
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <strong class="text-secondary d-flex align-items-center">
                        <i class="bi bi-code me-2"></i>Karate Test Step:
                    </strong>
                    <pre class="bg-secondary bg-opacity-10 p-2 mt-2 rounded border border-secondary" style="font-size: 0.8em;">${test.karateStep || 'No Karate step available'}</pre>
                </div>
            `;
        } else {
            console.warn('requestModalContent element not found');
        }

        // Populate Response Container
        const responseModalContent = document.getElementById('responseModalContent');
        if (responseModalContent) {
            responseModalContent.innerHTML = `
                <div class="row mb-3">
                    <div class="col-md-12">
                        <strong class="text-success d-flex align-items-center">
                            <i class="bi bi-check-circle me-2"></i>API Response Analysis:
                        </strong>
                        <div class="mt-2">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="p-3 bg-primary bg-opacity-10 rounded border border-primary text-center">
                                        <strong class="text-primary">Actual Response</strong>
                                        <div class="mt-2">
                                            <span class="badge ${this.getStatusCodeClass(test.statusCode)} fs-4 me-2">${test.statusCode}</span>
                                        </div>
                                        <small class="text-muted">${this.getStatusCodeDescription(test.statusCode)}</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="p-3 bg-info bg-opacity-10 rounded border border-info text-center">
                                        <strong class="text-info">Expected Code</strong>
                                        <div class="mt-2">
                                            <span class="badge ${this.getStatusCodeClass(this.getExpectedStatusCode(test.scenario))} fs-4">${this.getExpectedStatusCode(test.scenario)}</span>
                                        </div>
                                        <small class="text-muted">${this.getStatusCodeDescription(this.getExpectedStatusCode(test.scenario))}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center mt-2">
                                <span class="badge ${test.statusCode == this.getExpectedStatusCode(test.scenario) ? 'bg-success' : 'bg-danger'} fs-5">
                                    ${test.statusCode == this.getExpectedStatusCode(test.scenario) ? '✓ EXACT MATCH' : '✗ CODE MISMATCH'}
                                </span>
                                <div class="mt-1">
                                    <small class="text-muted">
                                        ${test.statusCode == this.getExpectedStatusCode(test.scenario) ? 
                                          `API returned expected ${this.getExpectedStatusCode(test.scenario)} response code` : 
                                          `Expected ${this.getExpectedStatusCode(test.scenario)}, but got ${test.statusCode}`}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-12">
                        <strong class="text-success d-flex align-items-center">
                            <i class="bi bi-clipboard-check me-2"></i>Test Execution Result:
                        </strong>
                        <div class="mt-2 p-3 bg-light rounded border text-center">
                            <span class="badge ${test.status === 'PASSED' ? 'bg-success' : 'bg-danger'} fs-5">${test.status}</span>
                            <div class="mt-1">
                                <small class="text-muted">${test.status === 'PASSED' ? 'Test executed successfully - All assertions passed' : 'Test failed - One or more assertions did not pass'}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <strong class="text-success d-flex align-items-center">
                        <i class="bi bi-arrow-down-circle me-2"></i>Response Data:
                    </strong>
                    <pre class="bg-white p-3 mt-2 rounded border" style="max-height: 400px; overflow-y: auto; font-size: 0.85em;">${responseInfo}</pre>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-success" onclick="navigator.clipboard.writeText(\`${responseInfo.replace(/`/g, '\\`')}\`)">
                            <i class="bi bi-clipboard"></i> Copy Response
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <strong class="text-warning d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle me-2"></i>Additional Test Details:
                    </strong>
                    <div class="bg-warning bg-opacity-10 p-3 mt-2 rounded border border-warning">
                        ${test.details || 'No additional details available'}
                    </div>
                </div>
            `;
        } else {
            console.warn('responseModalContent element not found');
        }

        // Store both request and response for copying
        this.currentResponse = responseInfo;
        this.currentRequest = requestInfo;

        // Show the modal and set focus for accessibility
        modal.show();
        setTimeout(() => {
            modalEl.focus();
        }, 300);
    }

    // Helper function to get stored form data
    getStoredFormData() {
        try {
            return this.lastFormData || null;
        } catch (e) {
            return null;
        }
    }

    // New helper method to format Karate test case
    formatKarateTestCase(test) {
        const lines = [];
        lines.push('Feature: API Test Case');
        lines.push('');
        lines.push('Background:');
        lines.push('  * url baseUrl');
        lines.push('');
        lines.push(`Scenario: ${test.scenario}`);
        
        // Format the karateStep into proper Karate syntax
        if (test.karateStep) {
            const steps = test.karateStep.split('\n');
            steps.forEach(step => {
                if (step.trim()) {
                    lines.push(`  ${step.trim()}`);
                }
            });
        }
        
        return lines.join('\n');
    }

    // New helper method to get test purpose description
    getTestPurpose(scenario) {
        const purposes = {
            'Valid Request Test': 'Basic API connectivity and successful response validation',
            'Invalid Endpoint Test': 'Error handling for non-existent endpoints (404 responses)',
            'Authentication Test': 'Authentication failure scenarios with invalid credentials',
            'Authentication Required Test': 'Token-based authentication failure validation',
            'Response Validation Test': 'Response structure and content validation',
            'Request Validation Test': 'Input validation with invalid request data',
            'Data Boundary Test': 'Boundary conditions and large data handling',
            'Response Time Performance Test': 'Performance validation and response time limits',
            'Content Type Validation Test': 'HTTP content-type header validation'
        };
        
        return purposes[scenario] || 'API functionality and behavior validation';
    }

    // New method to setup collapse behavior with icon rotation
    setupCollapseBehavior() {
        const collapseElement = document.getElementById('testScenarioCollapse');
        const iconElement = document.getElementById('testScenarioIcon');
        
        if (collapseElement && iconElement) {
            collapseElement.addEventListener('show.bs.collapse', function () {
                iconElement.className = 'bi bi-chevron-down me-1';
            });
            
            collapseElement.addEventListener('hide.bs.collapse', function () {
                iconElement.className = 'bi bi-chevron-right me-1';
            });
        }
    }

    // Filter test results based on status
    filterResults(filterType) {
        if (!this.currentResults) return;
        
        const filterStatus = document.getElementById('filterStatus');
        const filterText = document.getElementById('filterText');
        const testRows = document.querySelectorAll('.test-result-row');
        const resultsContainer = document.getElementById('testResultsContainer');
        
        // Add filtering animation class
        resultsContainer.classList.add('filtering');
        
        // Remove active class from all tiles
        document.querySelectorAll('.filter-tile').forEach(tile => {
            tile.classList.remove('active');
        });
        
        // Apply filtering with slight delay for smooth animation
        setTimeout(() => {
            let visibleCount = 0;
            testRows.forEach((row) => {
                let shouldShow = false;
                
                switch (filterType) {
                    case 'all':
                        shouldShow = true;
                        break;
                    case 'passed':
                        shouldShow = row.classList.contains('result-passed');
                        break;
                    case 'failed':
                        shouldShow = row.classList.contains('result-failed');
                        break;
                }
                
                if (shouldShow) {
                    row.classList.remove('hidden');
                    row.classList.remove('filtered-out');
                    visibleCount++;
                } else {
                    row.classList.add('hidden');
                }
            });
            
            // Update filter status indicator
            this.updateFilterStatus(filterType, visibleCount);
            
            // Add active class to clicked tile with animation
            this.setActiveTile(filterType);
            
            // Remove filtering animation class
            resultsContainer.classList.remove('filtering');
            
        }, 100);
    }
    
    // Update filter status indicator
    updateFilterStatus(filterType, visibleCount) {
        const filterStatus = document.getElementById('filterStatus');
        const filterText = document.getElementById('filterText');
        
        if (filterType === 'all') {
            filterStatus.style.display = 'none';
        } else {
            const statusText = filterType === 'passed' ? 'Passed Tests' : 'Failed Tests';
            filterText.textContent = `${statusText} (${visibleCount} of ${this.currentResults.testResults.length})`;
            filterStatus.style.display = 'inline-block';
        }
    }
    
    // Set active tile styling
    setActiveTile(filterType) {
        const tileMap = {
            'all': 'totalTestsTile',
            'passed': 'passedTestsTile',
            'failed': 'failedTestsTile'
        };
        
        const activeTileId = tileMap[filterType] || 'totalTestsTile';
        const activeTile = document.getElementById(activeTileId);
        
        if (activeTile) {
            activeTile.classList.add('active');
        }
    }
    
    // Setup keyboard navigation for filter tiles
    setupFilterKeyboardNavigation() {
        const filterTiles = document.querySelectorAll('.filter-tile');
        
        filterTiles.forEach(tile => {
            tile.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    tile.click();
                }
            });
        });
    }

    getStatusCodeClass(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'bg-success';
        if (statusCode >= 300 && statusCode < 400) return 'bg-warning';
        if (statusCode >= 400 && statusCode < 500) return 'bg-danger';
        if (statusCode >= 500) return 'bg-dark';
        return 'bg-secondary';
    }

    getStatusCodeDescription(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'Success - Request completed successfully';
        if (statusCode >= 300 && statusCode < 400) return 'Redirect - Additional action needed';
        if (statusCode >= 400 && statusCode < 500) return 'Client Error - Invalid request';
        if (statusCode >= 500) return 'Server Error - Internal server issue';
        return 'Unknown status code';
    }

    copyTestCases() {
        const content = document.getElementById('testCasesContent').textContent;
        this.copyToClipboard(content, 'Test cases copied to clipboard!');
    }

    copyFeatureFile() {
        const content = document.getElementById('featureFileContent').textContent;
        this.copyToClipboard(content, 'Feature file copied to clipboard!');
    }

    copyResponse() {
        if (this.currentResponse) {
            this.copyToClipboard(this.currentResponse, 'Response copied to clipboard!');
        }
    }

    copyRequest() {
        if (this.currentRequest) {
            this.copyToClipboard(this.currentRequest, 'Request details copied to clipboard!');
        }
    }

    copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            this.showAlert(successMessage, 'success');
        }).catch(() => {
            this.showAlert('Failed to copy to clipboard', 'danger');
        });
    }

    downloadFeatureFile() {
        const content = document.getElementById('testCasesContent').textContent;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'karate-tests.feature';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showAlert('Feature file downloaded!', 'success');
    }

    clearResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.style.display = 'none';
        
        // Hide download button
        document.getElementById('downloadReportBtn').style.display = 'none';
        
        this.currentResults = null;
        this.updateRoadmapStep(3, 'not-started');
        this.showAlert('Results cleared', 'info');
    }

    // New methods for enhanced functionality
    initializeRoadmap() {
        this.updateRoadmapStep(1, 'not-started');
        this.announceToScreenReader('Workflow roadmap initialized. Ready to start.');
    }

    updateRoadmapStep(stepNumber, status) {
        const step = document.getElementById(`roadmapStep${stepNumber}`);
        const statusText = step?.querySelector('.status-text');
        
        if (!step) return;

        // Remove all status classes
        step.classList.remove('active', 'completed', 'error');
        
        // Add new status class and update status text
        if (status !== 'not-started') {
            step.classList.add(status);
        }
        
        // Update status text and announce to screen readers
        let statusMessage = '';
        switch (status) {
            case 'active':
                statusMessage = 'In progress';
                break;
            case 'completed':
                statusMessage = 'Completed';
                break;
            case 'error':
                statusMessage = 'Error occurred';
                break;
            default:
                statusMessage = 'Not started';
        }
        
        if (statusText) {
            statusText.textContent = statusMessage;
        }
        
        // Update ARIA label for accessibility
        step.setAttribute('aria-label', `Step ${stepNumber}: ${statusMessage}`);
        
        // Announce status change to screen readers
        this.announceToScreenReader(`Step ${stepNumber} status: ${statusMessage}`);
    }
    
    announceToScreenReader(message) {
        const announcements = document.getElementById('sr-announcements');
        if (announcements) {
            announcements.textContent = message;
        }
    }

    getExpectedStatusCode(scenario) {
        // Extract expected status code from scenario name
        if (scenario.includes('404') || scenario.includes('Not Found')) return '404';
        if (scenario.includes('401') || scenario.includes('Unauthorized')) return '401';
        if (scenario.includes('400') || scenario.includes('Bad Request')) return '400';
        if (scenario.includes('500') || scenario.includes('Server Error')) return '500';
        if (scenario.includes('201') || scenario.includes('Created')) return '201';
        if (scenario.includes('204') || scenario.includes('No Content')) return '204';
        
        // Default expected codes based on HTTP method
        const method = document.getElementById('apiMethod').value;
        switch (method) {
            case 'POST': return '201';
            case 'PUT': return '200';
            case 'DELETE': return '204';
            case 'PATCH': return '200';
            default: return '200';
        }
    }

    copyAllScripts() {
        if (!this.currentTestCases) {
            this.showAlert('No test cases to copy', 'warning');
            return;
        }
        
        let allScripts = '# Generated Karate DSL Test Scripts\n\n';
        allScripts += '## Feature File\n\n```gherkin\n';
        allScripts += this.currentTestCases;
        allScripts += '\n```\n\n';
        
        if (this.currentResults && this.currentResults.featureFile) {
            allScripts += '## Executable Feature File\n\n```gherkin\n';
            allScripts += this.currentResults.featureFile;
            allScripts += '\n```\n';
        }
        
        this.copyToClipboard(allScripts, 'All scripts copied to clipboard!');
    }

    downloadAllScripts() {
        if (!this.currentTestCases) {
            this.showAlert('No test cases to download', 'warning');
            return;
        }
        
        // Create a zip-like structure with multiple files
        const scripts = {
            'karate-tests.feature': this.currentTestCases,
            'test-results.json': this.currentResults ? JSON.stringify(this.currentResults, null, 2) : '{}',
            'readme.md': `# Karate DSL Test Suite\n\nGenerated on: ${new Date().toISOString()}\n\n## Files:\n- karate-tests.feature: Main test scenarios\n- test-results.json: Execution results\n\n## Usage:\nRun with Karate framework using the feature file.`
        };
        
        // For now, download the main feature file
        // TODO: Implement proper zip download
        this.downloadFeatureFile();
        
        this.showAlert('Scripts package prepared for download!', 'success');
    }

    showLoading(message, title = 'Processing...') {
        // Function to try showing loading modal
        const tryShowLoading = () => {
            try {
                // Debug: Check what elements are in the DOM
                console.log('DOM readyState:', document.readyState);
                console.log('All modals in DOM:', document.querySelectorAll('[id*="Modal"]'));
                console.log('Looking for loadingModal...');
                
                // Get modal elements with better error handling
                const loadingModal = document.getElementById('loadingModal');
                const loadingTitle = document.getElementById('loadingTitle');
                const loadingMessage = document.getElementById('loadingMessage');
                const loadingProgress = document.getElementById('loadingProgress');
                
                console.log('loadingModal found:', !!loadingModal);
                
                if (!loadingModal) {
                    return false; // Element not found, will retry
                }
                
                // Update content safely
                if (loadingTitle) {
                    loadingTitle.textContent = title;
                } else {
                    console.warn('loadingTitle element not found');
                }
                
                if (loadingMessage) {
                    loadingMessage.textContent = message;
                } else {
                    console.warn('loadingMessage element not found');
                }
                
                if (loadingProgress) {
                    loadingProgress.style.width = '0%';
                } else {
                    console.warn('loadingProgress element not found');
                }
                
                // Show the modal using Bootstrap
                let modal;
                if (typeof bootstrap !== 'undefined') {
                    modal = new bootstrap.Modal(loadingModal);
                    modal.show();
                } else {
                    // Fallback: show modal manually
                    loadingModal.classList.add('show');
                    loadingModal.style.display = 'block';
                    document.body.classList.add('modal-open');
                }
                
                // Store modal reference for later hiding
                this.currentModal = modal;
                
                // Animate progress bar
                if (loadingProgress) {
                    setTimeout(() => loadingProgress.style.width = '30%', 500);
                    setTimeout(() => loadingProgress.style.width = '60%', 1500);
                    setTimeout(() => loadingProgress.style.width = '90%', 3000);
                }
                
                return true; // Success
                
            } catch (error) {
                console.error('Error showing loading modal:', error);
                return false;
            }
        };

        // Check if DOM is ready
        if (document.readyState === 'loading') {
            // DOM is still loading, wait for it
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    if (!tryShowLoading()) {
                        console.error('Loading modal not found in DOM after DOM ready');
                    }
                }, 100);
            });
        } else {
            // DOM is ready, try immediately then with delays if needed
            if (!tryShowLoading()) {
                setTimeout(() => {
                    if (!tryShowLoading()) {
                        // Last attempt with longer delay
                        setTimeout(() => {
                            if (!tryShowLoading()) {
                                console.error('Loading modal not found in DOM after all retries');
                            }
                        }, 500);
                    }
                }, 100);
            }
        }
    }

    hideLoading() {
        try {
            // Complete the progress bar
            const loadingProgress = document.getElementById('loadingProgress');
            if (loadingProgress) {
                loadingProgress.style.width = '100%';
            }
            
            // Hide the modal after a brief delay
            setTimeout(() => {
                const loadingModalEl = document.getElementById('loadingModal');
                if (loadingModalEl) {
                    // Try using stored modal reference first
                    if (this.currentModal) {
                        this.currentModal.hide();
                        this.currentModal = null;
                    } else {
                        // Fallback to getInstance
                        const loadingModal = bootstrap.Modal.getInstance(loadingModalEl);
                        if (loadingModal) {
                            loadingModal.hide();
                        } else {
                            // Manual fallback
                            loadingModalEl.classList.remove('show');
                            loadingModalEl.style.display = 'none';
                            document.body.classList.remove('modal-open');
                            // Remove backdrop if present
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) {
                                backdrop.remove();
                            }
                        }
                    }
                }
                
                // Reset progress bar
                setTimeout(() => {
                    if (loadingProgress) {
                        loadingProgress.style.width = '0%';
                    }
                }, 300);
            }, 500);
        } catch (error) {
            console.error('Error in hideLoading:', error);
            // Force cleanup on error
            const loadingModalEl = document.getElementById('loadingModal');
            if (loadingModalEl) {
                loadingModalEl.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alertDiv);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Add a new method to reset UI and state for a fresh workflow
KarateTestGenerator.prototype.resetWorkflowUI = function() {
    // Hide test cases section
    const testCasesSection = document.getElementById('testCasesSection');
    if (testCasesSection) {
        testCasesSection.style.display = 'none';
        document.getElementById('testCasesContent').innerHTML = '';
        document.getElementById('testCaseCountNumber').textContent = '0';
    }
    // Hide automation section
    const automationSection = document.getElementById('automationSection');
    if (automationSection) {
        automationSection.style.display = 'none';
    }
    // Hide results container
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    // Clear feature file content
    const featureFileContent = document.getElementById('featureFileContent');
    if (featureFileContent) {
        featureFileContent.textContent = '';
    }
    // Reset roadmap steps except step 1
    this.updateRoadmapStep(2, 'not-started');
    this.updateRoadmapStep(3, 'not-started');
    // Clear stored test cases and results
    this.currentTestCases = null;
    this.currentResults = null;
    this.currentResponse = null;
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const karateGenerator = new KarateTestGenerator();
    
    // Make it globally accessible for inline onclick handlers
    window.karateGenerator = karateGenerator;
    
    // Add event listeners for filter tiles (replacing inline onclick handlers)
    document.getElementById('totalTestsTile').addEventListener('click', function() {
        karateGenerator.filterResults('all');
    });
    
    document.getElementById('passedTestsTile').addEventListener('click', function() {
        karateGenerator.filterResults('passed');
    });
    
    document.getElementById('failedTestsTile').addEventListener('click', function() {
        karateGenerator.filterResults('failed');
    });
    
    document.getElementById('successRateTile').addEventListener('click', function() {
        karateGenerator.filterResults('all');
    });
    
    // Add event listener for filter clear button
    const filterClearBtn = document.querySelector('.filter-clear-btn');
    if (filterClearBtn) {
        filterClearBtn.addEventListener('click', function() {
            karateGenerator.filterResults('all');
        });
    }
});