#!/bin/bash

# Script to generate Android release keystore for DietWise
# Run from project root: ./scripts/generate-android-keystore.sh

set -e

echo "🔐 Generating Android Release Keystore for DietWise"
echo "=================================================="
echo ""
echo "This script will create a release keystore for signing your Android app."
echo "IMPORTANT: Keep the keystore and passwords secure!"
echo ""

# Check if keystore already exists
if [ -f "android/app/keystore/dietwise-release.keystore" ]; then
    echo "⚠️  WARNING: Keystore already exists at android/app/keystore/dietwise-release.keystore"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without creating new keystore."
        exit 1
    fi
fi

# Create keystore directory if it doesn't exist
mkdir -p android/app/keystore

# Generate the keystore
echo ""
echo "📝 Please provide the following information:"
echo "- Store password (min 6 characters)"
echo "- Key password (can be same as store password)"
echo "- Your full name"
echo "- Organizational unit (e.g., Development)"
echo "- Organization: Wizard Tech LLC"
echo "- City/Locality"
echo "- State/Province"
echo "- Country code: US"
echo ""

keytool -genkey -v \
    -keystore android/app/keystore/dietwise-release.keystore \
    -alias dietwise \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000

echo ""
echo "✅ Keystore generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create android/keystore.properties with:"
echo "   storePassword=YOUR_STORE_PASSWORD"
echo "   keyPassword=YOUR_KEY_PASSWORD"
echo "   keyAlias=dietwise"
echo "   storeFile=keystore/dietwise-release.keystore"
echo ""
echo "2. Configure android/app/build.gradle to use the keystore"
echo ""
echo "3. IMPORTANT: Backup the keystore file and passwords securely!"
echo "   You cannot update your app without this keystore!"
echo ""
echo "4. Make sure both files are in .gitignore (they should be already)"
echo ""

# Check if keystore.properties exists
if [ ! -f "android/keystore.properties" ]; then
    read -p "Would you like to create keystore.properties now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -sp "Enter store password: " STORE_PASS
        echo
        read -sp "Enter key password: " KEY_PASS
        echo
        
        cat > android/keystore.properties << EOF
storePassword=$STORE_PASS
keyPassword=$KEY_PASS
keyAlias=dietwise
storeFile=keystore/dietwise-release.keystore
EOF
        
        chmod 600 android/keystore.properties
        echo "✅ keystore.properties created successfully!"
    fi
fi

echo ""
echo "🎉 Done! Your app is ready for release signing."