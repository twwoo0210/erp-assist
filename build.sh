#!/bin/bash

# Clean dist directory
rm -rf dist

# Build client with Vite
echo "Building client..."
npx vite build

# Copy public assets (before placeholder replacement)
if [ -d "public" ]; then
  echo "Copying public assets..."
  cp -r public/* dist/ 2>/dev/null || true
fi

# Replace BASE_PATH in HTML files
echo "Replacing BASE_PATH in HTML files..."
if [ -n "$BASE_PATH" ]; then
  find dist -name "*.html" -type f -exec sed -i "s|%BASE_PATH%|${BASE_PATH}|g" {} \;
else
  # Default to / for local development
  find dist -name "*.html" -type f -exec sed -i "s|%BASE_PATH%|/erp-assist|g" {} \;
fi

# Replace BASE_URL placeholder in HTML files
if [ -n "$BASE_PATH" ]; then
  BASE_URL="${BASE_PATH%/}/"
else
  BASE_URL="/erp-assist/"
fi
find dist -name "*.html" -type f -exec sed -i "s|%BASE_URL%|${BASE_URL}|g" {} \;

# Build Cloudflare Functions
echo "Building Cloudflare Functions..."
npx esbuild functions/[[api]].ts --bundle --format=esm --outfile=dist/_worker.js --platform=neutral --external:hono

# Create _routes.json for Cloudflare Pages
echo "Creating _routes.json..."
cat > dist/_routes.json << 'EOF'
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
EOF

echo "Build complete!"
