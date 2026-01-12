#!/bin/bash
set -e

# Build packages
echo "Building packages..."
npm run build

# Create rich spec
echo "Creating rich_spec.json..."
cat <<EOF > rich_spec.json
{
  "name": "todo-app",
  "stack": "nextjs",
  "models": [
    {
      "name": "Todo",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "completed", "type": "boolean" }
      ]
    }
  ],
  "pages": [
    {
      "route": "/",
      "title": "My Todos",
      "blocks": [
        { "type": "TableCRUD", "model": "Todo" }
      ]
    }
  ]
}
EOF

# Clean output
console_log="Cleaning ./todo-app..."
rm -rf ./todo-app

# Run CLI
echo "Running CLI..."
node packages/cli/dist/index.js create rich_spec.json ./todo-app

echo "Done. Check ./todo-app/app/page.tsx"
