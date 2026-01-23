#!/bin/bash

# Demo: Auto-Healing Agent with Live UI Status
# This script demonstrates the full auto-healing workflow

echo "🚀 Auto-Healing Agent Demo"
echo "======================================"
echo ""

# Check if Ollama is running
if ! curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama is not running!"
    echo "Please start Ollama first: ollama serve"
    exit 1
fi

echo "✅ Ollama is running"
echo ""

# Check if webapp is running
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "❌ Webapp is not running!"
    echo "Please start the webapp first:"
    echo "  cd packages/webapp && npm run dev"
    exit 1
fi

echo "✅ Webapp is running"
echo ""

# Get project name from user
read -p "Enter project name to heal (or press Enter for 'fintech-api'): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-fintech-api}

echo ""
echo "🤖 Starting Auto-Healing Agent for: $PROJECT_NAME"
echo "======================================"
echo ""
echo "The agent will:"
echo "  1. Monitor server logs every 5 seconds"
echo "  2. Detect compilation/runtime errors"
echo "  3. Ask Qwen AI for fixes"
echo "  4. Apply fixes automatically"
echo "  5. Display status LIVE in the webapp UI"
echo ""
echo "Open http://localhost:3001 to see the healing status overlay!"
echo ""
echo "Press Ctrl+C to stop the agent"
echo ""

# Run the agent
node packages/agent/dist/index.js "$PROJECT_NAME"
