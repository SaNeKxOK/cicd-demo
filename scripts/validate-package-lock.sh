#!/bin/bash

# Check if package.json and package-lock.json are in sync
echo "Validating package.json and package-lock.json sync..."

# Check if npm ci --dry-run passes
if ! npm ci --dry-run > /dev/null 2>&1; then
    echo "❌ Error: package.json and package-lock.json are out of sync!"
    echo "Please run 'npm install' to fix the sync issue."
    exit 1
fi

echo "✅ Package files are in sync!"
exit 0
