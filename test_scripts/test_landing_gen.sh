#!/bin/bash
set -e

# Build packages
echo "Building packages..."
npm run build

# Create landing spec
echo "Creating landing_spec.json..."
cat <<EOF > landing_spec.json
{
  "name": "landing-app",
  "stack": "nextjs",
  "models": [],
  "pages": [
    {
      "route": "/",
      "title": "Welcome",
      "blocks": [
        { 
          "type": "Hero", 
          "headline": "Build Offline First",
          "subheadline": "The best way to build web apps without internet access. Powered by SLMs.",
          "ctaText": "Get Started"
        },
        {
          "type": "Features",
          "title": "Why Offline?",
          "features": [
            { "title": "Privacy", "description": "Your data never leaves your machine." },
            { "title": "Speed", "description": "No network latency. Instant compilation." },
            { "title": "Reliability", "description": "Works on airplanes, trains, and in bunkers." }
          ]
        }
      ]
    }
  ]
}
EOF

# Clean output
echo "Cleaning ./landing-app..."
rm -rf ./landing-app

# Run CLI
echo "Running CLI..."
node packages/cli/dist/index.js create landing_spec.json ./landing-app

echo "Done. Check ./landing-app/app/page.tsx"
