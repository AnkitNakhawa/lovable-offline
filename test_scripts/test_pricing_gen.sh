#!/bin/bash
set -e

# Build packages
echo "Building packages..."
npm run build

# Create landing spec
echo "Creating pricing_spec.json..."
cat <<EOF > pricing_spec.json
{
  "name": "pricing-app",
  "stack": "nextjs",
  "models": [],
  "pages": [
    {
      "route": "/",
      "title": "Pricing",
      "blocks": [
        { 
          "type": "Navbar", 
          "logo": "SaaS Inc.",
          "links": [
             { "label": "Home", "href": "/" },
             { "label": "Features", "href": "/#features" }
          ]
        },
        { 
          "type": "Hero", 
          "headline": "Simple Pricing",
          "subheadline": "Choose the plan that fits your needs.",
          "ctaText": "View Plans"
        },
        {
          "type": "Pricing",
          "title": "Our Plans",
          "plans": [
            {
              "name": "Starter",
              "price": "Free",
              "features": ["1 User", "5 Projects", "Community Support"],
              "ctaText": "Start Free"
            },
            {
              "name": "Pro",
              "price": "$29",
              "features": ["Unlimited Users", "Unlimited Projects", "Priority Support", "Analytics"],
              "ctaText": "Go Pro"
            },
             {
              "name": "Enterprise",
              "price": "$99",
              "features": ["SSO", "Dedicated Manager", "SLA", "Custom Integrations"],
              "ctaText": "Contact Sales"
            }
          ]
        },
        {
          "type": "Footer",
          "copyright": "© 2026 SaaS Inc.",
          "links": []
        }
      ]
    }
  ]
}
EOF

# Clean output
echo "Cleaning ./pricing-app..."
rm -rf ./pricing-app

# Run CLI
echo "Running CLI..."
node packages/cli/dist/index.js create pricing_spec.json ./pricing-app

echo "Done. Check ./pricing-app/app/page.tsx"
