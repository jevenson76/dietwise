# DietWise - Build Instructions

## Prerequisites

### Development Environment
- Node.js 18+ 
- Java JDK 17+ (for Android builds)
- Android Studio with Android SDK
- Xcode 15+ (for iOS builds, macOS only)

## Web Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the dist/ directory
```

## Android Build

### 1. Setup Android Environment

Install Java JDK 17+:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y openjdk-17-jdk

# macOS
brew install openjdk@17

# Windows - Download from Oracle or use Chocolatey
choco install openjdk17
```

Install Android Studio and configure Android SDK.

### 2. Generate Release Keystore

**⚠️ IMPORTANT: Keep your keystore secure! You cannot update your app without it.**

```bash
# Navigate to project directory
cd android

# Generate keystore (replace with your actual information)
keytool -genkey -v \
  -keystore app/keystore/dietwise-release.keystore \
  -alias dietwise \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=DietWise, OU=Mobile Apps, O=Wizard Tech LLC, L=YourCity, S=YourState, C=US" \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD
```

### 3. Configure Keystore Properties

Create `android/keystore.properties` (DO NOT COMMIT TO GIT):
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=dietwise
storeFile=keystore/dietwise-release.keystore
```

### 4. Build Android APK/AAB

```bash
# Sync web assets to Android
npx cap sync android

# Open in Android Studio (recommended)
npx cap open android

# Or build from command line
cd android
./gradlew assembleRelease        # Creates APK
./gradlew bundleRelease          # Creates AAB (preferred for Play Store)
```

**Output files:**
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## iOS Build

### 1. Setup iOS Environment (macOS only)

- Install Xcode 15+ from Mac App Store
- Install Xcode Command Line Tools: `xcode-select --install`
- Install CocoaPods: `sudo gem install cocoapods`

### 2. Configure iOS Project

```bash
# Sync web assets to iOS
npx cap sync ios

# Install iOS dependencies
cd ios/App && pod install

# Open in Xcode
npx cap open ios
```

### 3. iOS Build Steps

1. Open project in Xcode
2. Select your development team in project settings
3. Configure bundle identifier: `com.wizardtech.dietwise`
4. Set deployment target to iOS 13.0+
5. Configure signing certificates
6. Build for release:
   - Product → Archive
   - Distribute App → App Store Connect

## Environment Configuration

### Production Environment Variables

Create `.env.production` in project root:
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
```

### Backend Configuration

1. Deploy backend to production server
2. Set environment variables (see `backend/.env.example`)
3. Run database migrations
4. Configure Stripe webhooks

## Build Checklist

### Pre-Build
- [ ] Update version numbers in `package.json`
- [ ] Test app thoroughly on devices
- [ ] Verify all features work offline
- [ ] Test payment flow with Stripe
- [ ] Generate app icons and splash screens

### Android Specific
- [ ] Generate release keystore
- [ ] Configure signing in `android/app/build.gradle`
- [ ] Test on multiple device sizes
- [ ] Verify camera permissions
- [ ] Test barcode scanning functionality

### iOS Specific
- [ ] Configure proper bundle ID
- [ ] Set up development/distribution certificates
- [ ] Configure app capabilities (camera)
- [ ] Test on multiple device sizes
- [ ] Verify App Store compliance

### App Store Preparation
- [ ] Create app store listings
- [ ] Upload screenshots (see `app-store-assets/screenshots/`)
- [ ] Write compelling descriptions
- [ ] Set up app store metadata
- [ ] Configure pricing and availability

## Troubleshooting

### Common Android Issues

**Build Errors:**
- Ensure Java JDK 17+ is installed
- Clear gradle cache: `cd android && ./gradlew clean`
- Sync project: `npx cap sync android`

**Keystore Issues:**
- Never lose your keystore file
- Backup keystore and passwords securely
- Use same keystore for all app updates

### Common iOS Issues

**Signing Errors:**
- Ensure Apple Developer account is active
- Configure correct provisioning profiles
- Check bundle ID matches developer account

**Pod Installation:**
- Update CocoaPods: `sudo gem install cocoapods`
- Clean pods: `cd ios/App && pod deintegrate && pod install`

## Release Process

### 1. Version Bump
```bash
# Update version in package.json
npm version patch  # or minor/major

# Update Android version
# Edit android/app/build.gradle:
# versionCode 2
# versionName "1.0.1"

# Update iOS version in Xcode project settings
```

### 2. Build and Test
```bash
# Build web assets
npm run build

# Sync to platforms
npx cap sync

# Test on devices
npx cap run android
npx cap run ios
```

### 3. Release Builds
```bash
# Android
cd android && ./gradlew bundleRelease

# iOS - use Xcode Archive process
```

### 4. Store Submission
- Upload AAB to Google Play Console
- Upload IPA to App Store Connect
- Fill out store metadata
- Submit for review

## Security Notes

**Never commit these files:**
- `android/keystore.properties`
- `android/app/keystore/*.keystore`
- `ios/App/App/GoogleService-Info.plist` (if using Firebase)
- `.env.production` or similar files with secrets

**Always backup:**
- Android keystore files
- iOS certificates and provisioning profiles
- Environment variable configurations
- Database connection strings

## Support

For build issues:
1. Check this documentation
2. Review Capacitor documentation: https://capacitorjs.com/docs
3. Check platform-specific guides
4. Contact development team