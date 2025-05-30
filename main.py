from fastapi import FastAPI, Form, UploadFile
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from llama_cpp import Llama
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Llama model
model_path = os.getenv("MODEL_PATH")
llm = None
if model_path and os.path.exists(model_path):
    llm = Llama(model_path=model_path, n_ctx=2048, n_threads=8)

@app.get("/", response_class=HTMLResponse)
def read_root():
    with open("templates/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.post("/generate-test-cases")
async def generate_test_cases(
    requirement: str = Form(...),
    operation: str = Form(...),
    file: UploadFile = None
):
    print(">>> generate-test-cases called with:", requirement[:30], operation)
    if file:
        print(">>> file uploaded:", file.filename)

    if llm is None:
        return JSONResponse({"error": "Model still loading, please retry in a few seconds."}, status_code=503)

    # Build prompt
    prompt = (
        "You are a BDD test-case generator. "
        f"Generate all possible {operation} test cases in Gherkin style for requirement:\n{requirement}"
    )
    print(">>> Sending prompt to LLM (first 80 chars):", prompt[:80])

    try:
        response = llm.create_completion(
            prompt=prompt,
            max_tokens=1024,
            temperature=0.7,
            top_p=0.9
        )
        text = response["choices"][0]["text"]
        print(f">>> LLM returned {len(text)} characters")
        return JSONResponse({"output": text})
    except Exception as e:
        print(">>> Error from LLM:", str(e))
        return JSONResponse({"error": str(e)}, status_code=500)
