#!/bin/bash
set -e

# Build the project
echo "Building packages..."
npm run build

# Create a spec file (example.json)
echo "Creating example.json..."
echo '{ "name": "my-app", "stack": "nextjs", "models": [], "pages": [] }' > example.json

# Run the CLI
echo "Running CLI..."
node packages/cli/dist/index.js create example.json ./my-app
echo "Generation complete! Check ./my-app"
