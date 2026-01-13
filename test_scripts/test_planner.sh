#!/bin/bash
set -e

# Build packages
echo "Building packages..."
npm run build --workspace=@lovable/planner
npm run build --workspace=@lovable/engine
npm run build --workspace=@lovable/cli

# Clean output
echo "Cleaning ./generated-gym..."
rm -rf ./generated-gym

# Run CLI with magic command
echo "Running CLI Magic (This uses Ollama, make sure it's running)..."

# Prompt: Create a landing page for a gym called 'FitLife' with pricing.
# We'll use a slightly complex prompt to test the AI's ability to infer blocks.
node packages/cli/dist/index.js magic "Create a landing page for a modern gym called FitLife. I want a navbar, a hero section saying 'Get fit today', a features section with 'Personal Training' and '24/7 Access', a pricing section with 'Basic' (\$30) and 'Premium' (\$50) tiers, and a footer." ./generated-gym

echo "Done. Check ./generated-gym/app/page.tsx"
