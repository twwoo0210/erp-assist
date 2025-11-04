#!/bin/bash

# Clean dist directory
rm -rf dist

# Build client with Vite
echo "Building client..."
npx vite build

# Replace BASE_PATH in HTML files
echo "Replacing BASE_PATH in HTML files..."
if [ -n "$BASE_PATH" ]; then
  find dist -name "*.html" -type f -exec sed -i "s|%BASE_PATH%|${BASE_PATH}|g" {} \;
else
  # Default to / for local development
  find dist -name "*.html" -type f -exec sed -i "s|%BASE_PATH%|/erp-assist|g" {} \;
fi

# Build Cloudflare Functions
echo "Building Cloudflare Functions..."
npx esbuild functions/[[api]].ts --bundle --format=esm --outfile=dist/_worker.js --platform=neutral --external:hono

# Copy public assets if needed
if [ -d "public" ]; then
  echo "Copying public assets..."
  cp -r public/* dist/ 2>/dev/null || true
fi

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
