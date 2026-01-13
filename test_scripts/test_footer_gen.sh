#!/bin/bash
set -e

# Build packages
echo "Building packages..."
npm run build

# Create landing spec
echo "Creating footer_spec.json..."
cat <<EOF > footer_spec.json
{
  "name": "footer-app",
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
            { "label": "About", "href": "/about" }
          ]
        },
        { 
          "type": "Hero", 
          "headline": "Footer Demo",
          "subheadline": "Scroll down to see the footer.",
          "ctaText": "Scroll Down"
        },
        {
          "type": "Footer",
          "copyright": "© 2026 Lovable Offline. All rights reserved.",
          "links": [
            { "label": "Privacy Policy", "href": "/privacy" },
            { "label": "Terms of Service", "href": "/terms" },
            { "label": "Contact", "href": "/contact" }
          ]
        }
      ]
    }
  ]
}
EOF

# Clean output
echo "Cleaning ./footer-app..."
rm -rf ./footer-app

# Run CLI
echo "Running CLI..."
node packages/cli/dist/index.js create footer_spec.json ./footer-app

echo "Done. Check ./footer-app/app/page.tsx"
