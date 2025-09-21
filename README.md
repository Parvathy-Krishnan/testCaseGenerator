# BDD Test Case Generator

## Tech Stack

- **Python (FastAPI):** Backend API server for generating test cases.
- **llama_cpp:** Python bindings for running LLaMA models locally (optional, can be switched).
- **OpenAI:** Cloud-based LLM API for generating test cases (default).
- **dotenv:** Loads environment variables from a `.env` file.
- **HTML/CSS/JavaScript (Bootstrap):** Frontend for user interaction and display.
- **Static Files:** Frontend assets and generated test case files are served from the `static` directory.

## Project Overview

This project generates BDD (Gherkin-style) test cases using either a locally hosted LLaMA model or the OpenAI API. Users can input requirements, select test case types (Positive/Negative/Both), and download generated test cases in CSV/Excel format.

## Setup Instructions


### 1. Install Python Dependencies

Ensure Python 3.8+ is installed. Then run:

```sh
pip install -r requiremnts.txt
```

If you encounter errors about missing packages, install them individually:

- For OpenAI:
	```sh
	pip install openai
	```
- For dotenv:
	```sh
	pip install python-dotenv
	```
- For FastAPI form support:
	```sh
	pip install python-multipart
	```
- For Comcast OpenAI API integration:
	```sh
	pip install requests
	```

### 2. Configure Model Providers

#### For OpenAI GPT (recommended):
1. **Get an OpenAI API Key**:
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create an account or log in
   - Generate a new API key
   - Copy the API key (starts with `sk-...`)

2. **Add to .env file**:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

3. **Important Security Notes**:
   - Never commit your `.env` file to version control
   - Keep your API key secure and don't share it
   - Monitor your OpenAI usage to avoid unexpected charges
   - Consider setting usage limits in your OpenAI account

#### For LLaMA (local):
- Download your LLaMA model file.
- Set the path in your `.env` file:
	```
	MODEL_PATH=/absolute/path/to/your/llama/model.bin
	```

#### For Comcast OpenAI API:
- Get your Comcast OpenAI bearer token.
- Set it in your `.env` file:
	```
	OPENAI_API_KEY=your-comcast-bearer-token
	```

#### For Karate Test Execution (via MCP):
- Deploy the Karate Runner service (a simple Java/Spring Boot app) to your MCP environment.
- Set the URL for the runner service in your `.env` file:
  ```
  KARATE_RUNNER_URL=http://your-karate-runner-app.mcp-apps.com/run-karate
  ```

### 3. Start the FastAPI Server

Run the server:

```sh
/Users/pkrish529/Documents/pk_workspace/testCaseGenerator/.venv/bin/python main.py
```

Or for development (with auto-reload):

```sh
uvicorn main:app --reload
```

### 4. Access the Web UI

Open your browser and go to:

```
http://localhost:8000/
```

## Usage


- Enter your requirement and select the operation.
- (Optional) Upload a requirement file.
- Click "Generate Test Cases".
- Copy or download the generated test cases as needed.

## Switching Between LLaMA and OpenAI

- By default, the project uses the Comcast OpenAI API for test case generation.
- To switch to LLaMA, uncomment the relevant code blocks in `main.py` and comment out the Comcast OpenAI code block.
- Ensure your `.env` file has the correct keys for the provider you want to use.

## Notes

- Ensure the LLaMA model is downloaded and the path is correct in `.env` if using LLaMA.
- Ensure your Comcast OpenAI bearer token is set in `.env` if using the Comcast API.
- If you encounter errors like `ModuleNotFoundError`, install the missing package using pip as shown above.
- If you encounter model loading errors, check the path and file permissions.

## File Structure

- `main.py`: FastAPI backend server.
- `test_llama.py`: LLaMA model integration and test case generation logic.
- `static/`: Frontend assets and generated files.
- `requiremnts.txt`: Python dependencies.

---

For more details, see the source files in the repository.
mvn spring-boot:run      

 source /Users/pkrish529/Documents/pk_workspace/testCaseGenerator/.venv/bin/activate

 uvicorn main:app --host 127.0.0.1 --port 8000 --reload
 