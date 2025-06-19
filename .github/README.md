# DietWise GitHub Actions Workflows

This repository includes comprehensive GitHub Actions workflows for building, testing, and deploying the DietWise mobile application.

## 🚀 Available Workflows

### 1. CI/CD Pipeline (`ci.yml`)
**Triggers**: Push to main/develop, Pull requests to main

**Jobs:**
- **lint-and-test**: TypeScript checks, linting, and testing
- **build-web**: Build PWA for web deployment
- **build-android**: Build Android APK (triggered on main branch or `[mobile]` in commit message)
- **build-ios**: Build iOS app (triggered on main branch or `[mobile]` in commit message)

### 2. Deploy to Stores (`deploy.yml`)
**Triggers**: Release published, Manual workflow dispatch

**Jobs:**
- **deploy-web**: Deploy PWA to GitHub Pages
- **deploy-android-internal**: Deploy to Google Play Internal Testing or Production
- **deploy-ios**: Deploy to TestFlight and App Store

### 3. Security Checks (`security.yml`)
**Triggers**: Push to main/develop, Pull requests, Weekly schedule

**Jobs:**
- **dependency-check**: npm audit for vulnerabilities
- **secrets-scan**: Scan for exposed secrets
- **code-quality**: Check for hardcoded credentials
- **bundle-analysis**: Analyze build output for security issues

### 4. Capacitor Setup (`capacitor-setup.yml`)
**Triggers**: Manual workflow dispatch

**Purpose**: One-time setup to configure Capacitor for mobile deployment
- Initializes Capacitor configuration
- Adds Android/iOS platforms
- Configures camera permissions
- Updates project structure

### 5. Create Release (`release.yml`)
**Triggers**: Manual workflow dispatch

**Purpose**: Create tagged releases with automated changelog generation
- Updates version in package.json
- Generates changelog from git commits
- Creates GitHub release with assets
- Triggers deployment workflows

## 🔧 Required Secrets

Add these secrets to your repository settings:

### General
- `GEMINI_API_KEY`: Your Google Gemini API key

### Android Deployment
- `ANDROID_KEYSTORE`: Base64 encoded Android keystore file
- `KEYSTORE_PASSWORD`: Keystore password
- `KEY_ALIAS`: Key alias name
- `KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT`: Google Play Console service account JSON

### iOS Deployment
- `IOS_DIST_CERT`: Base64 encoded iOS distribution certificate (.p12)
- `IOS_DIST_CERT_PASSWORD`: Certificate password
- `APPSTORE_ISSUER_ID`: App Store Connect API issuer ID
- `APPSTORE_KEY_ID`: App Store Connect API key ID
- `APPSTORE_PRIVATE_KEY`: App Store Connect API private key

## 📱 Mobile App Workflow

### Initial Setup
1. Run the **Capacitor Setup** workflow to initialize mobile platforms
2. Configure signing certificates and provisioning profiles
3. Set up required secrets in repository settings

### Development Workflow
1. Push code changes to trigger CI pipeline
2. Include `[mobile]` in commit messages to trigger mobile builds
3. Create pull requests for code review and testing

### Release Workflow
1. Use **Create Release** workflow to tag new versions
2. Release publication automatically triggers store deployment
3. Monitor deployment status in Actions tab

## 🔒 Security Features

- **Automated vulnerability scanning**: Weekly dependency audits
- **Secret detection**: Prevents accidental commit of API keys
- **Build artifact analysis**: Ensures no secrets in compiled code
- **Environment variable validation**: Checks proper secret usage

## 📊 Build Artifacts

Each successful build produces:
- **Web builds**: Deployed to GitHub Pages for testing
- **Android APKs/AABs**: For distribution via Google Play
- **iOS IPAs**: For TestFlight and App Store distribution

## 🚨 Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version compatibility (using v18)
2. **Mobile builds not triggering**: Ensure `[mobile]` in commit message or push to main
3. **Deployment failures**: Verify all required secrets are configured
4. **Permission errors**: Check Android/iOS platform configurations

### Getting Help

1. Check workflow logs in the Actions tab
2. Review secret configuration in repository settings
3. Ensure all required dependencies are in package.json
4. Verify Capacitor configuration is correct

## 📈 Performance Optimization

The workflows are optimized for:
- **Parallel execution**: Multiple jobs run simultaneously
- **Caching**: Node.js dependencies cached between runs
- **Conditional builds**: Mobile builds only when needed
- **Artifact retention**: 7-day retention for build outputs

## 🔄 Maintenance

- Review and update workflow dependencies monthly
- Monitor security alerts and apply updates promptly
- Archive old releases and artifacts to save storage
- Update secrets when certificates expire

---

For more details about DietWise development, see the main [README.md](../README.md) file.