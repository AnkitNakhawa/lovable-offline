#!/bin/bash
set -e

# Build everything
echo "Building packages..."
npm run build

# Create dummy spec
echo "Creating dummy spec..."
cat <<EOF > dummy_spec.json
{
  "name": "test-app",
  "stack": "nextjs",
  "models": [
    {
      "name": "Task",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "completed", "type": "boolean" }
      ]
    }
  ],
  "pages": [
    {
      "route": "/",
      "title": "Home",
      "blocks": []
    }
  ]
}
EOF

# Run CLI
echo "Running CLI..."
# We use node to run the built CLI directly
node packages/cli/dist/index.js create dummy_spec.json ./test-output

# Verify output
if [ -f "./test-output/package.json" ]; then
    echo "SUCCESS: package.json created"
else
    echo "FAILURE: package.json missing"
    exit 1
fi

if [ -f "./test-output/prisma/schema.prisma" ]; then
    echo "SUCCESS: prisma/schema.prisma created"
else
    echo "FAILURE: prisma/schema.prisma missing"
    exit 1
fi

echo "All checks passed!"
