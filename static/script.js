// Enhanced JavaScript for API Test Case Generator

class TestCaseGenerator {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.testCases = [];
        this.totalTestCases = 0;
        this.currentData = null;
        
        this.initializeEventListeners();
        this.initializeInputMethodToggle();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('testCaseForm').addEventListener('submit', (e) => this.handleFormSubmission(e));
        
        // Input method toggle
        document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleInputMethod());
        });
        
        // Clear buttons
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllInputs());
        document.getElementById('clearResponseBtn').addEventListener('click', () => this.clearResponse());
        
        // Action buttons
        document.getElementById('copyBtn').addEventListener('click', () => this.copyCurrentPage());
        document.getElementById('copyAllBtn').addEventListener('click', () => this.copyAllTestCases());
        document.getElementById('downloadCsvBtn').addEventListener('click', () => this.downloadFile('csv'));
        document.getElementById('downloadExcelBtn').addEventListener('click', () => this.downloadFile('excel'));
        document.getElementById('downloadTxtBtn').addEventListener('click', () => this.downloadFile('txt'));
        
        // Pagination
        document.querySelectorAll('.page-prev').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.displayCurrentPage();
                }
            });
        });
        
        document.querySelectorAll('.page-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage < this.getTotalPages()) {
                    this.currentPage++;
                    this.displayCurrentPage();
                }
            });
        });
        
        // REST Assured test generation
        document.getElementById('generateRestAssuredBtn').addEventListener('click', () => this.generateRestAssuredTests());
        
        // Automation script execution
        document.getElementById('runAutomationBtn').addEventListener('click', () => this.runAutomationScript());
        
        // Copy test class button
        document.getElementById('copyTestClassBtn').addEventListener('click', () => this.copyTestClass());
        
        // File input validation
        document.getElementById('requirementFile').addEventListener('change', (e) => this.validateFileInput(e));
        
        // API Method change handler
        document.getElementById('apiMethod').addEventListener('change', () => this.handleMethodChange());
        
        // Form validation
        this.setupFormValidation();
    }

    initializeInputMethodToggle() {
        this.toggleInputMethod();
        this.handleMethodChange(); // Initialize method-based field visibility
        this.setupFileUploadEnhancements(); // Initialize file upload enhancements
    }

    setupFileUploadEnhancements() {
        const fileInput = document.getElementById('requirementFile');
        const fileSection = document.getElementById('fileInputSection');

        if (fileInput && fileSection) {
            // Drag and drop functionality
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileSection.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                fileSection.addEventListener(eventName, () => {
                    fileSection.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                fileSection.addEventListener(eventName, () => {
                    fileSection.classList.remove('drag-over');
                }, false);
            });

            fileSection.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    this.validateFileInput({ target: fileInput });
                }
            }, false);

            // Click to select file
            fileSection.addEventListener('click', (e) => {
                if (e.target !== fileInput) {
                    fileInput.click();
                }
            });
        }
    }

    toggleInputMethod() {
        const textInput = document.getElementById('textInput').checked;
        const textSection = document.getElementById('textInputSection');
        const fileSection = document.getElementById('fileInputSection');
        const requirementTextarea = document.getElementById('requirement');
        const requirementFile = document.getElementById('requirementFile');
        const indicator = document.getElementById('inputMethodIndicator');

        if (textInput) {
            textSection.style.display = 'block';
            fileSection.style.display = 'none';
            requirementTextarea.required = true;
            requirementFile.required = false;
            if (indicator) indicator.textContent = 'Current: Text Input Mode';
        } else {
            textSection.style.display = 'none';
            fileSection.style.display = 'block';
            requirementTextarea.required = false;
            requirementFile.required = true;
            if (indicator) indicator.textContent = 'Current: File Upload Mode';
        }
    }

    handleMethodChange() {
        const method = document.getElementById('apiMethod').value;
        const payloadSection = document.getElementById('payloadSection');
        const idSection = document.getElementById('idSection');
        const payloadField = document.getElementById('payload');
        const idField = document.getElementById('resourceId');

        // Hide all sections first
        payloadSection.style.display = 'none';
        idSection.style.display = 'none';
        payloadField.required = false;
        idField.required = false;

        // Show appropriate section based on method
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            payloadSection.style.display = 'block';
            payloadField.required = true;
        } else if (method === 'DELETE') {
            idSection.style.display = 'block';
            idField.required = true;
        }
        // For GET, neither section is shown (both remain hidden)
    }

    setupFormValidation() {
        const form = document.getElementById('testCaseForm');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        const errorDiv = field.parentNode.querySelector('.field-error');
        
        if (errorDiv) {
            errorDiv.remove();
        }
        
        if (!isValid && field.value.trim() !== '') {
            this.showFieldError(field, field.validationMessage);
        }
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-danger small mt-1';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('is-invalid');
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.classList.remove('is-invalid');
    }

    validateFileInput(event) {
        const file = event.target.files[0];
        const allowedTypes = ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const fileSection = document.getElementById('fileInputSection');

        if (file) {
            if (!allowedTypes.includes(file.type)) {
                this.showAlert('Please select a valid file format (.txt, .doc, .docx, .pdf)', 'warning');
                event.target.value = '';
                fileSection.classList.add('upload-error');
                setTimeout(() => fileSection.classList.remove('upload-error'), 3000);
                return false;
            }
            
            if (file.size > maxSize) {
                this.showAlert('File size must be less than 5MB', 'warning');
                event.target.value = '';
                fileSection.classList.add('upload-error');
                setTimeout(() => fileSection.classList.remove('upload-error'), 3000);
                return false;
            }
            
            // Success feedback
            fileSection.classList.add('upload-success');
            setTimeout(() => fileSection.classList.remove('upload-success'), 3000);
            this.showAlert(`File "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) selected successfully`, 'success');
        }
        return true;
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.showLoader(true);
        
        const formData = new FormData(document.getElementById('testCaseForm'));
        const startTime = performance.now();

        try {
            const response = await fetch('/generate-test-cases', {
                method: 'POST',
                body: formData
            });

            const endTime = performance.now();
            const data = await response.json();

            if (data.output) {
                this.clearResponse();
                this.processTestCaseData(data.output);
                this.updateStatusInfo(endTime - startTime, true);
                this.showRestAssuredButton();
            } else {
                this.showError(data.error || 'Unknown error occurred');
                this.updateStatusInfo(endTime - startTime, false);
            }
        } catch (error) {
            this.showError(`Request failed: ${error.message}`);
            this.updateStatusInfo(0, false);
        } finally {
            this.showLoader(false);
        }
    }

    validateForm() {
        const textInput = document.getElementById('textInput').checked;
        let isValid = true;

        if (textInput) {
            const requirement = document.getElementById('requirement').value.trim();
            if (!requirement) {
                this.showAlert('Please enter a requirement', 'warning');
                isValid = false;
            }
        } else {
            const file = document.getElementById('requirementFile').files[0];
            if (!file) {
                this.showAlert('Please select a file', 'warning');
                isValid = false;
            }
        }

        return isValid;
    }

    processTestCaseData(output) {
        // Parse the test cases from the output
        this.testCases = this.parseTestCases(output);
        this.totalTestCases = this.testCases.length;
        this.currentData = output;
        this.currentPage = 1;
        
        document.getElementById('testCaseCountStatus').textContent = this.totalTestCases;
        this.displayCurrentPage();
        this.showActionButtons();
        this.showResultsContainer();
    }

    parseTestCases(output) {
        // Split the output into individual test cases
        const lines = output.split('\n');
        const testCases = [];
        let currentTestCase = '';
        let foundFirstScenario = false;

        for (let line of lines) {
            const trimmedLine = line.trim();
            // A new test case can be identified by lines starting with 'Test Case' or 'Scenario'.
            // This covers 'Scenario:', 'Scenario Outline:', and 'Scenario: Some name'.
            if (trimmedLine.startsWith('Test Case') || trimmedLine.startsWith('Scenario')) {
                // If we have content in currentTestCase and we've already found the first scenario,
                // push the completed test case.
                if (foundFirstScenario && currentTestCase.trim()) {
                    testCases.push(currentTestCase.trim());
                }
                currentTestCase = line;
                foundFirstScenario = true;
            } else {
                currentTestCase += '\n' + line;
            }
        }
        
        // Push the last test case if it exists.
        if (foundFirstScenario && currentTestCase.trim()) {
            testCases.push(currentTestCase.trim());
        }
        
        // If no scenarios were found, return the whole output as one item, or an empty array if output is empty.
        return testCases.length > 0 ? testCases : (output.trim() ? [output.trim()] : []);
    }

    displayCurrentPage() {
        if (this.testCases.length === 0) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.testCases.length);
        const currentPageCases = this.testCases.slice(startIndex, endIndex);
        
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = currentPageCases.join('\n\n');
        
        this.updatePaginationControls();
    }

    updatePaginationControls() {
        const totalPages = this.getTotalPages();
        const paginationContainers = document.querySelectorAll('#paginationTop, #paginationBottom');

        if (totalPages <= 1) {
            paginationContainers.forEach(c => c.style.display = 'none');
            return;
        }
        
        paginationContainers.forEach(c => c.style.display = 'block');

        document.querySelectorAll('.page-current').forEach(el => el.textContent = this.currentPage);
        document.querySelectorAll('.page-info').forEach(el => el.textContent = `${this.currentPage} of ${totalPages}`);
        document.querySelectorAll('.page-items-info').forEach(el => el.textContent = `${this.testCases.length}`);
        
        // Update pagination buttons
        const prevBtns = document.querySelectorAll('.page-prev');
        const nextBtns = document.querySelectorAll('.page-next');
        
        if (this.currentPage <= 1) {
            prevBtns.forEach(btn => btn.classList.add('disabled'));
        } else {
            prevBtns.forEach(btn => btn.classList.remove('disabled'));
        }
        
        if (this.currentPage >= totalPages) {
            nextBtns.forEach(btn => btn.classList.add('disabled'));
        } else {
            nextBtns.forEach(btn => btn.classList.remove('disabled'));
        }
    }

    getTotalPages() {
        return Math.ceil(this.testCases.length / this.itemsPerPage);
    }

    updateStatusInfo(responseTime, success) {
        const statusInfo = document.getElementById('statusInfo');
        const responseTimeElement = document.getElementById('responseTime');
        const timestampElement = document.getElementById('timestamp');
        const statusElement = document.getElementById('generationStatus');
        
        responseTimeElement.textContent = `${(responseTime / 1000).toFixed(2)}s`;
        timestampElement.textContent = new Date().toLocaleString();
        statusElement.textContent = success ? 'Success' : 'Failed';
        statusElement.parentElement.querySelector('i').className = `bi bi-check-circle text-${success ? 'success' : 'danger'}`;
        statusElement.className = `fw-bold text-${success ? 'success' : 'danger'}`;
        
        statusInfo.style.display = 'block';
    }

    showLoader(show) {
        const loader = document.getElementById('loader');
        const resultsContainer = document.getElementById('resultsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (show) {
            loader.style.display = 'block';
            resultsContainer.style.display = 'none';
            emptyState.style.display = 'none';
        } else {
            loader.style.display = 'none';
            // Restore visibility based on whether we have results
            resultsContainer.style.display = this.testCases.length > 0 ? 'block' : 'none';
            emptyState.style.display = this.testCases.length > 0 ? 'none' : 'block';
        }
    }

    showResultsContainer() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.style.display = 'block';
        resultsContainer.setAttribute('aria-hidden', 'false');
        document.getElementById('emptyState').style.display = 'none';
        resultsContainer.focus(); // Accessibility: Move focus to the results
    }

    showActionButtons() {
        document.getElementById('actionButtons').style.display = 'block';
        document.getElementById('clearResponseBtn').style.display = 'inline-block';
    }

    showRestAssuredButton() {
        const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
        if (apiEndpoint) {
            document.getElementById('generateRestAssuredBtn').style.display = 'block';
            document.getElementById('runAutomationBtn').style.display = 'block';
        }
    }

    copyCurrentPage() {
        const resultDiv = document.getElementById('result');
        navigator.clipboard.writeText(resultDiv.textContent).then(() => {
            this.showAlert('Current page copied to clipboard!', 'success');
        }).catch(() => {
            this.showAlert('Failed to copy to clipboard', 'danger');
        });
    }

    copyAllTestCases() {
        const allTestCases = this.testCases.join('\n\n');
        navigator.clipboard.writeText(allTestCases).then(() => {
            this.showAlert('All test cases copied to clipboard!', 'success');
        }).catch(() => {
            this.showAlert('Failed to copy to clipboard', 'danger');
        });
    }

    downloadFile(format) {
        if (!this.currentData) return;
        
        let content, mimeType, extension;
        
        switch (format) {
            case 'csv':
                content = this.convertToCSV(this.testCases);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'excel':
                content = this.convertToExcel(this.testCases);
                mimeType = 'application/vnd.ms-excel';
                extension = 'xls';
                break;
            case 'txt':
            default:
                content = this.testCases.join('\n\n');
                mimeType = 'text/plain';
                extension = 'txt';
                break;
        }
        
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `test_cases_${new Date().toISOString().slice(0, 10)}.${extension}`;
        link.click();
        
        this.showAlert(`Test cases downloaded as ${extension.toUpperCase()}!`, 'success');
    }

    convertToCSV(testCases) {
        const headers = ['Test Case ID', 'Description', 'Steps', 'Expected Result'];
        let csv = headers.join(',') + '\n';
        
        testCases.forEach((testCase, index) => {
            const lines = testCase.split('\n');
            const id = `TC_${(index + 1).toString().padStart(3, '0')}`;
            const description = lines[0] || '';
            const steps = lines.slice(1).join(' ').replace(/,/g, ';');
            const expectedResult = 'As per requirement';
            
            csv += `"${id}","${description}","${steps}","${expectedResult}"\n`;
        });
        
        return csv;
    }

    convertToExcel(testCases) {
        // Simple tab-separated format that Excel can read
        let content = 'Test Case ID\tDescription\tSteps\tExpected Result\n';
        
        testCases.forEach((testCase, index) => {
            const lines = testCase.split('\n');
            const id = `TC_${(index + 1).toString().padStart(3, '0')}`;
            const description = lines[0] || '';
            const steps = lines.slice(1).join(' ');
            const expectedResult = 'As per requirement';
            
            content += `${id}\t${description}\t${steps}\t${expectedResult}\n`;
        });
        
        return content;
    }

    async generateRestAssuredTests() {
        const apiData = {
            apiEndpoint: document.getElementById('apiEndpoint').value,
            method: document.getElementById('apiMethod').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            body: document.getElementById('payload').value,
            resourceId: document.getElementById('resourceId').value
        };

        if (!apiData.apiEndpoint) {
            this.showAlert('Please enter an API endpoint to generate Karate tests', 'warning');
            return;
        }

        try {
            this.showLoader(true);
            const response = await fetch('/run-rest-assured', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            });

            const data = await response.json();

            if (response.ok) {
                this.displayKarateResult(data);
            } else {
                this.showError(`Karate test failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (error) {
            this.showError(`Failed to generate Karate test: ${error.message}`);
        } finally {
            this.showLoader(false);
        }
    }

    displayKarateResult(result) {
        const resultDiv = document.getElementById('result');
        const karateCode = this.generateKarateCode(result);
        resultDiv.textContent = `Karate Test Result:\n\nStatus Code: ${result.statusCode}\nResponse: ${result.response}\n\n${karateCode}`;
        this.showAlert('Karate test executed successfully!', 'success');
    }

    generateKarateCode(result) {
        const apiEndpoint = document.getElementById('apiEndpoint').value;
        const method = document.getElementById('apiMethod').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const payload = document.getElementById('payload').value;

        let code = `Feature: API Test for ${apiEndpoint}

Background:
  * url '${apiEndpoint}'`;

        if (username && password) {
            code += `
  * def basicAuth = call read('classpath:basic-auth.js') { username: '${username}', password: '${password}' }
  * header Authorization = basicAuth`;
        }

        code += `

Scenario: Test ${method} Request
  Given path ''`;

        if (payload && payload.trim() && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            code += `
  And request ${payload}`;
        }

        code += `
  When method ${method.toUpperCase()}
  Then status ${result.statusCode}
  And match response != null
  * print 'Response:', response`;

        return code;
    }

    async runAutomationScript() {
        const apiData = {
            apiEndpoint: document.getElementById('apiEndpoint').value,
            method: document.getElementById('apiMethod').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            body: document.getElementById('payload').value,
            resourceId: document.getElementById('resourceId').value
        };

        if (!apiData.apiEndpoint) {
            this.showAlert('Please enter an API endpoint to run Karate automation script', 'warning');
            return;
        }

        try {
            this.showLoader(true);
            document.getElementById('loader').querySelector('div:last-child').textContent = 'Running Karate tests...';
            
            const response = await fetch('/run-automation-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            });

            const data = await response.json();

            if (response.ok) {
                this.displayAutomationResults(data);
            } else {
                this.showError(`Karate automation script failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (error) {
            this.showError(`Failed to run Karate automation script: ${error.message}`);
        } finally {
            this.showLoader(false);
            document.getElementById('loader').querySelector('div:last-child').textContent = 'Generating test cases...';
        }
    }

    displayAutomationResults(results) {
        // Hide other sections
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
        
        // Show automation results
        const automationResults = document.getElementById('automationResults');
        automationResults.style.display = 'block';

        // Update summary
        document.getElementById('totalTests').textContent = results.summary.total;
        document.getElementById('passedTests').textContent = results.summary.passed;
        document.getElementById('failedTests').textContent = results.summary.failed;
        document.getElementById('successRate').textContent = results.summary.success_rate;

        // Update test results table
        const tbody = document.getElementById('testResultsBody');
        tbody.innerHTML = '';

        results.testResults.forEach((test, index) => {
            const row = document.createElement('tr');
            const statusClass = test.status === 'PASSED' ? 'text-success' : 'text-danger';
            const statusIcon = test.status === 'PASSED' ? 'check-circle-fill' : 'x-circle-fill';
            
            row.innerHTML = `
                <td>${test.scenario}</td>
                <td>
                    <span class="${statusClass}">
                        <i class="bi bi-${statusIcon}" aria-hidden="true"></i>
                        ${test.status}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getStatusCodeClass(test.statusCode)}">${test.statusCode}</span>
                </td>
                <td>
                    <small>${test.details}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="testGenerator.showTestResponse(${index})" 
                            ${!test.response ? 'disabled' : ''}>
                        <i class="bi bi-eye" aria-hidden="true"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Store results for response viewing
        this.automationResults = results.testResults;

        // Display feature file
        document.getElementById('automationTestClass').textContent = results.featureFile;

        // Show success message
        const message = `Automation completed: ${results.summary.passed}/${results.summary.total} tests passed`;
        this.showAlert(message, results.summary.failed === 0 ? 'success' : 'warning');

        // Scroll to results
        automationResults.scrollIntoView({ behavior: 'smooth' });
    }

    getStatusCodeClass(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'bg-success';
        if (statusCode >= 400 && statusCode < 500) return 'bg-warning text-dark';
        if (statusCode >= 500) return 'bg-danger';
        return 'bg-secondary';
    }

    showTestResponse(index) {
        const test = this.automationResults[index];
        if (!test.response) return;

        // Create modal content
        const modalContent = `
            <div class="modal fade" id="responseModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${test.scenario} - Response</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <strong>Status:</strong> 
                                <span class="badge ${this.getStatusCodeClass(test.statusCode)}">${test.statusCode}</span>
                            </div>
                            <div class="mb-3">
                                <strong>Response:</strong>
                                <pre class="bg-light p-3 mt-2 rounded border" style="max-height: 400px; overflow-y: auto;">${test.response}</pre>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-primary" onclick="navigator.clipboard.writeText('${test.response.replace(/'/g, "\\'")}')">
                                <i class="bi bi-clipboard" aria-hidden="true"></i> Copy Response
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('responseModal');
        if (existingModal) existingModal.remove();

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('responseModal'));
        modal.show();
    }

    copyTestClass() {
        const featureFile = document.getElementById('automationTestClass').textContent;
        navigator.clipboard.writeText(featureFile).then(() => {
            this.showAlert('Karate feature file copied to clipboard!', 'success');
        }).catch(() => {
            this.showAlert('Failed to copy feature file', 'error');
        });
    }

    clearAllInputs() {
        const form = document.getElementById('testCaseForm');
        form.reset();
        
        // Clear any error messages
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        document.querySelectorAll('.is-invalid').forEach(field => field.classList.remove('is-invalid'));
        
        // Reset input method to text
        document.getElementById('textInput').checked = true;
        this.toggleInputMethod();
        
        this.showAlert('All inputs cleared!', 'info');
    }

    clearResponse() {
        document.getElementById('result').textContent = '';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('resultsContainer').setAttribute('aria-hidden', 'true');
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('actionButtons').style.display = 'none';
        document.getElementById('clearResponseBtn').style.display = 'none';
        document.getElementById('generateRestAssuredBtn').style.display = 'none';
        document.getElementById('runAutomationBtn').style.display = 'none';
        document.getElementById('automationResults').style.display = 'none';
        document.getElementById('statusInfo').style.display = 'none';
        document.querySelectorAll('#paginationTop, #paginationBottom').forEach(c => c.style.display = 'none');
        document.getElementById('testCaseCountStatus').textContent = '-';
        
        this.testCases = [];
        this.totalTestCases = 0;
        this.currentData = null;
        this.currentPage = 1;
    }

    showError(message) {
        this.showAlert(`<strong>Error:</strong> ${message}`, 'danger');
    }

    showAlert(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible show position-fixed`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 1056; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.testCaseGenerator = new TestCaseGenerator();
});
  