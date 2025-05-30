from llama_cpp import Llama
from dotenv import load_dotenv
import os

# Load env
load_dotenv()

model_path = os.getenv("MODEL_PATH")
if not model_path or not os.path.exists(model_path):
    raise ValueError(f"Model path does not exist: {model_path}")

# Load model
llm = Llama(model_path=model_path, n_ctx=2048, n_threads=8)

# Run a simple prompt
response = llm("Hello, LLaMA!", max_tokens=64)
print(response)

