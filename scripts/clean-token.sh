#!/bin/bash

# Helper script to clean Cloudflare API token
# Removes whitespace, newlines, and validates format

echo "🔧 Cloudflare API Token Cleaner"
echo "================================"
echo ""
echo "This script will help you clean your API token from spaces/newlines."
echo ""

# Check if token provided as argument
if [ -n "$1" ]; then
    TOKEN="$1"
else
    echo "Paste your Cloudflare API token below and press Enter:"
    echo "(It's safe - this script only runs locally)"
    read -r TOKEN
fi

echo ""
echo "📋 Analyzing token..."
echo ""

# Original length
ORIGINAL_LENGTH=${#TOKEN}
echo "Original length: $ORIGINAL_LENGTH characters"

# Clean token (remove leading/trailing whitespace and newlines)
CLEAN_TOKEN=$(echo "$TOKEN" | tr -d '\n\r' | xargs)

# Cleaned length
CLEAN_LENGTH=${#CLEAN_TOKEN}
echo "Cleaned length: $CLEAN_LENGTH characters"

# Check if cleaning made a difference
if [ "$ORIGINAL_LENGTH" -ne "$CLEAN_LENGTH" ]; then
    echo ""
    echo "⚠️  WARNING: Found whitespace/newlines!"
    echo "   Removed: $(($ORIGINAL_LENGTH - $CLEAN_LENGTH)) characters"
fi

echo ""
echo "✅ Cleaned token:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$CLEAN_TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Validate format
if [ "$CLEAN_LENGTH" -lt 20 ]; then
    echo "❌ ERROR: Token seems too short ($CLEAN_LENGTH chars)"
    echo "   Cloudflare API tokens are usually 40+ characters"
    echo ""
    echo "   Please verify you copied the complete token from Cloudflare."
    exit 1
fi

# Check for obvious issues
if [[ "$CLEAN_TOKEN" =~ [[:space:]] ]]; then
    echo "❌ ERROR: Token still contains spaces!"
    echo "   This shouldn't happen. Please copy token again."
    exit 1
fi

if [[ ! "$CLEAN_TOKEN" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "⚠️  WARNING: Token contains unusual characters"
    echo "   Expected: letters, numbers, underscores, hyphens only"
    echo ""
fi

echo "✅ Token format looks valid!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Copy the cleaned token above (between the lines)"
echo "2. Go to GitHub: Settings → Secrets and variables → Actions"
echo "3. Delete old CLOUDFLARE_API_TOKEN (if exists)"
echo "4. Create new secret:"
echo "   Name: CLOUDFLARE_API_TOKEN"
echo "   Value: [paste cleaned token]"
echo "5. Click 'Add secret'"
echo ""
echo "💡 To copy to clipboard (on Linux with xclip):"
echo "   echo '$CLEAN_TOKEN' | xclip -selection clipboard"
echo ""

