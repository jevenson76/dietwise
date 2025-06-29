#!/bin/bash

# Set Netlify auth token
export NETLIFY_AUTH_TOKEN=nfp_ESscJhHVprU97kWXbbnupVkaTscf5uku1286

# Create new site and deploy
echo "Creating new Netlify site..."
netlify sites:create --name dietwise-$(date +%s) --manual

# Get the site ID from the output
SITE_ID=$(netlify api listSites --data '{}' | jq -r '.[] | select(.name | startswith("dietwise-")) | .id' | head -1)

if [ -z "$SITE_ID" ]; then
    echo "Failed to get site ID"
    exit 1
fi

echo "Deploying to site ID: $SITE_ID"
netlify deploy --prod --dir=dist --site=$SITE_ID

echo "Deployment complete!"
netlify open --site=$SITE_ID