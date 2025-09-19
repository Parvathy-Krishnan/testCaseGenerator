#!/bin/bash
# Usage: ./curl_chat_completion.sh '<PROMPT HERE>'

# Load the OpenAI API key from .env
OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2)

PROMPT="$1"

echo "Sending prompt: $PROMPT"
echo "Using token: $OPENAI_API_KEY"

curl -s https://gw.api-dev.de.comcast.com/openai/v1/chat/completions -X POST \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{ \"model\": \"gpt-4o\", \"messages\": [ { \"role\": \"user\", \"content\": \"$PROMPT\" } ], \"max_tokens\":4096, \"stream\":false }"
