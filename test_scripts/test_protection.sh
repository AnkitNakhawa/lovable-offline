#!/bin/bash
set -e

echo "=== Testing SmartWriter Protection ==="

# 1. Clean slate
echo "Step 1: Cleaning old test app..."
rm -rf ./test-protection-app

# 2. Generate initial app
echo "Step 2: Generating initial app..."
npm run build --workspace=@lovable/planner
npm run build --workspace=@lovable/engine
npm run build --workspace=@lovable/cli

node packages/cli/dist/index.js magic "Create a simple landing page for a coffee shop called BeanThere with a hero and footer" ./test-protection-app

# 3. Find the Hero component
echo "Step 3: Finding Hero component..."
HERO_FILE=$(find ./test-protection-app/components/generated -name "Hero*.tsx" | head -1)
echo "Found: $HERO_FILE"

# 4. Backup original content
echo "Step 4: Backing up original Hero content..."
cp "$HERO_FILE" "$HERO_FILE.backup"

# 5. Remove the header (simulate user edit)
echo "Step 5: Removing GENERATED header (simulating user edit)..."
tail -n +2 "$HERO_FILE" > "$HERO_FILE.tmp" && mv "$HERO_FILE.tmp" "$HERO_FILE"
echo "Header removed. First line is now:"
head -1 "$HERO_FILE"

# 6. Run an edit command
echo "Step 6: Running edit command..."
cd test-protection-app
node ../packages/cli/dist/index.js edit "Change the footer copyright to 2026 BeanThere Coffee Co"
cd ..

# 7. Check if Hero was protected
echo "Step 7: Checking if Hero was protected..."
# The current file has no header, backup has header
# So compare current with backup minus first line
tail -n +2 "$HERO_FILE.backup" > "$HERO_FILE.backup_no_header"
if diff -q "$HERO_FILE" "$HERO_FILE.backup_no_header" > /dev/null 2>&1; then
    echo "✅ SUCCESS: Hero component was NOT overwritten (protected)"
else
    echo "❌ FAILURE: Hero component was modified (protection failed)"
    diff "$HERO_FILE" "$HERO_FILE.backup_no_header"
    exit 1
fi

# 8. Check if Footer was updated
echo "Step 8: Checking if Footer was updated..."
if grep -q "2026 BeanThere Coffee Co" ./test-protection-app/components/generated/Footer*.tsx; then
    echo "✅ SUCCESS: Footer was updated (as expected)"
else
    echo "❌ FAILURE: Footer was not updated"
    exit 1
fi

echo ""
echo "=== All Tests Passed ==="
echo "Protection mechanism is working correctly!"
