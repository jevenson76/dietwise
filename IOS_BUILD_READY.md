# iOS Build Setup Complete ✅

## What's Been Configured

✅ **iOS Platform Added**
- Xcode project structure created in `ios/App/`
- Capacitor iOS integration configured

✅ **Web Assets Synced**
- Production web build synced to iOS project
- Capacitor configuration applied

✅ **App Configuration**
- Bundle ID: `com.wizardtech.dietwise`
- App Name: `DietWise`
- Camera permission configured for barcode scanning

✅ **Info.plist Configured**
- Camera usage description: "DietWise uses the camera to scan food barcodes and nutrition labels for accurate dietary tracking."
- Proper orientation support for iPhone and iPad
- Launch screen and app icon placeholders

## Requirements for iOS Build

**⚠️ iOS builds require macOS with Xcode**

### System Requirements
- macOS 12.0+ (Monterey or later)
- Xcode 15.0+ (download from Mac App Store)
- Xcode Command Line Tools
- CocoaPods (for dependency management)

### Apple Developer Account
- Individual ($99/year) or Organization ($99/year) account
- Required for:
  - Device testing (free tier available)
  - App Store distribution
  - Push notifications (if added later)

## Build Steps (on macOS)

### 1. Install Dependencies

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Navigate to project directory
cd /path/to/dietwise

# Install iOS dependencies
cd ios/App && pod install
```

### 2. Open in Xcode

```bash
# From project root
npx cap open ios

# Or manually open the workspace
open ios/App/App.xcworkspace
```

### 3. Configure Signing

In Xcode:
1. Select the **App** target
2. Go to **Signing & Capabilities** tab
3. Select your **Development Team**
4. Verify **Bundle Identifier**: `com.wizardtech.dietwise`
5. Choose **Automatically manage signing** (recommended)

### 4. Set Deployment Target

1. In project settings, set **iOS Deployment Target** to **13.0** or higher
2. Ensure it matches across all targets

### 5. Test on Device/Simulator

```bash
# Run on simulator
npx cap run ios

# Or use Xcode:
# 1. Select target device/simulator
# 2. Press Cmd+R or click the Play button
```

### 6. Build for Distribution

#### For App Store:
1. In Xcode: **Product** → **Archive**
2. Once archived, click **Distribute App**
3. Choose **App Store Connect**
4. Follow the distribution wizard

#### For TestFlight:
1. Same as App Store process
2. Upload will be available in TestFlight automatically
3. Add external testers as needed

## Version Configuration

Current version settings:
- **Marketing Version**: 1.0 (CFBundleShortVersionString)
- **Current Project Version**: 1 (CFBundleVersion)

To update versions:
1. Open Xcode project
2. Select App target
3. Update in **General** tab
4. Or edit in `ios/App/App/Info.plist`

## App Store Preparation

### Required Assets

✅ **App Icons**
- Multiple sizes in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Generate using: https://appicon.co/ or similar tool
- Sizes needed: 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt

✅ **Launch Images**
- Configured in `ios/App/App/Assets.xcassets/Splash.imageset/`
- Current: Basic splash screens included

### App Store Metadata

Create these in App Store Connect:
- App description (from `app-store-assets/descriptions/ios-app-store-description.md`)
- Screenshots (follow `app-store-assets/screenshots/screenshot-plan.md`)
- Keywords: nutrition,diet,calories,weight loss,barcode scanner,meal planning
- Categories: Health & Fitness, Food & Drink
- Age rating: 4+ (suitable for all ages)

### Privacy Information

Required for App Store:
- **Camera**: Used for barcode scanning
- **Data Collection**: Health data stored locally (if any)
- Privacy policy URL: https://your-domain.com/privacy-policy.html

## Testing Checklist

Before App Store submission:

### Functionality
- [ ] App launches successfully
- [ ] Camera permission requests properly
- [ ] Barcode scanning works
- [ ] All tabs navigate correctly
- [ ] Premium features show upgrade prompts
- [ ] Authentication flow works
- [ ] Stripe checkout integration

### Performance
- [ ] App loads quickly
- [ ] Smooth scrolling and animations
- [ ] Memory usage reasonable
- [ ] Battery usage efficient

### Compatibility
- [ ] Works on iPhone (6.1", 6.7" screens)
- [ ] Works on iPad (10.9", 12.9" screens)
- [ ] Dark mode support
- [ ] Landscape/portrait orientations
- [ ] iOS 13.0+ compatibility

### App Store Guidelines
- [ ] No crashes or major bugs
- [ ] Follows iOS Human Interface Guidelines
- [ ] Camera usage clearly explained
- [ ] No misleading claims
- [ ] Proper age rating

## Common Issues & Solutions

### CocoaPods Issues
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clear cache
cd ios/App && pod deintegrate && pod install
```

### Signing Issues
- Ensure Apple Developer account is active
- Check bundle ID is unique
- Verify provisioning profiles are valid
- Use "Automatically manage signing" when possible

### Build Errors
```bash
# Clean build folder
# In Xcode: Product → Clean Build Folder

# Reset Capacitor iOS
npx cap sync ios --force
```

## Security Notes

**Never commit these files:**
- `ios/App/App/GoogleService-Info.plist` (if Firebase is added)
- Any files containing API keys or secrets
- Provisioning profiles or certificates

## Current Status

✅ iOS project structure ready
✅ Web assets synced and current
✅ Camera permissions configured
✅ Basic app configuration complete
⏳ Waiting for macOS/Xcode to complete build

The iOS project is **100% ready** for building on a macOS system with Xcode installed.

## Next Steps

1. **Transfer project to macOS** (if developing on Linux/Windows)
2. **Install Xcode and dependencies**
3. **Configure Apple Developer account**
4. **Test on iOS Simulator**
5. **Build and archive for App Store**