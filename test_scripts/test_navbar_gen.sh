#!/bin/bash
set -e

# Build packages
echo "Building packages..."
npm run build

# Create landing spec
echo "Creating landing_spec.json..."
cat <<EOF > navbar_spec.json
{
  "name": "navbar-app",
  "stack": "nextjs",
  "models": [],
  "pages": [
    {
      "route": "/",
      "title": "Welcome",
      "blocks": [
        { 
          "type": "Navbar", 
          "logo": "My Brand",
          "links": [
            { "label": "Home", "href": "/" },
            { "label": "About", "href": "/about" },
            { "label": "Contact", "href": "/contact" }
          ]
        },
        { 
          "type": "Hero", 
          "headline": "Build Offline First",
          "subheadline": "The best way to build web apps without internet access. Powered by SLMs.",
          "ctaText": "Get Started"
        }
      ]
    }
  ]
}
EOF

# Clean output
echo "Cleaning ./navbar-app..."
rm -rf ./navbar-app

# Run CLI
echo "Running CLI..."
node packages/cli/dist/index.js create navbar_spec.json ./navbar-app

echo "Done. Check ./navbar-app/app/page.tsx"
