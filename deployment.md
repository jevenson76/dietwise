
# DietWise PWA Deployment Guide

This guide provides instructions for deploying the DietWise Progressive Web App (PWA) and packaging it for submission to app stores.

## 1. PWA Deployment (Web Hosting)

The DietWise application is built as a static single-page application (SPA) using React and TypeScript, served by an `index.html` file.

### Prerequisites:
*   A web hosting provider (e.g., Firebase Hosting, Netlify, Vercel, GitHub Pages, or any static site host).
*   A domain name (optional, but recommended for production).

### Steps:

1.  **Build the Application (if applicable):**
    *   Currently, the application uses ES modules directly in the browser with an import map. For a production deployment, you might consider a build step using tools like Vite, esbuild, or Create React App (if refactored) to bundle and optimize assets.
    *   If no build step is used, ensure all paths in `index.html` and your JS/TSX files are correct relative to the root of your deployment.

2.  **Prepare Files for Deployment:**
    *   Ensure all necessary static files are present:
        *   `index.html`
        *   `index.tsx` (and any other `.tsx`, `.ts` files if not bundled)
        *   `manifest.json`
        *   `sw.js` (Service Worker)
        *   `icons/` directory with all app icons
        *   Any other assets (images, CSS if separated).
    *   **Important: API Key:** The Gemini API key is expected to be available as `process.env.API_KEY`.
        *   **For static hosting without a Node.js backend build process:** This environment variable will NOT be directly available to your client-side JavaScript.
        *   **Solution for Static Sites:** You will need to replace `process.env.API_KEY` in `services/geminiService.ts` with the actual API key *before deployment* or load it via a configuration file that is NOT committed to public version control.
        *   **Secure Approach (Recommended for Production):** The best practice is to use a build step where environment variables can be securely injected, or proxy API requests through a backend where the API key is stored securely. For AI Studio and similar environments, the platform handles `process.env.API_KEY`. For self-deployment, this needs careful handling. **DO NOT hardcode the API key directly into version-controlled files if your repository is public.**

3.  **Upload Files:**
    *   Upload all prepared files and directories to the root of your chosen web hosting provider.

4.  **Configure HTTPS:**
    *   Ensure your site is served over HTTPS. PWAs require HTTPS for service workers and many modern browser features. Most hosting providers offer free SSL certificates (e.g., Let's Encrypt).

5.  **Test:**
    *   Access your PWA via its public URL. Test all features, offline capabilities, and installation prompts.

## 2. Android App Store Deployment (Google Play Store via TWA)

Trusted Web Activity (TWA) allows you to package your PWA into an Android app that can be published on the Google Play Store. Google's **Bubblewrap CLI** is the recommended tool for this.

### Prerequisites for TWA:

*   **A fully functional and compliant PWA:**
    *   Served over HTTPS.
    *   Valid `manifest.json`.
    *   Working Service Worker (`sw.js`) for offline capabilities.
    *   Good performance (meets Core Web Vitals).
*   **Development Environment:**
    *   Node.js and npm/yarn (for Bubblewrap).
    *   Java Development Kit (JDK) 8 or higher.
    *   Android Studio and Android SDK (recommended for advanced configuration, emulators, and SDK tools). Ensure `ANDROID_HOME` environment variable is set.

### Steps using Bubblewrap CLI:

1.  **Install Bubblewrap CLI:**
    ```bash
    npm install -g @bubblewrap/cli
    ```

2.  **Initialize your TWA Project:**
    *   Navigate to a new directory where you'll create the Android project.
    *   Run the init command, pointing to your *deployed* PWA's manifest:
        ```bash
        bubblewrap init --manifest https://[your-dietwise-app-url]/manifest.json
        ```
        (Replace `https://[your-dietwise-app-url]/manifest.json` with the actual public URL of your DietWise PWA's manifest file).
    *   Bubblewrap will ask a series of questions to configure the Android app (e.g., application ID, app name, launcher name, versions, signing key details). Provide appropriate values.

3.  **Digital Asset Links (`assetlinks.json`):**
    *   TWA requires a Digital Asset Link file to verify the association between your website and your Android app. This prevents other apps from impersonating your website.
    *   Bubblewrap will output the content for your `assetlinks.json` file during the initialization or build process.
    *   You **must** host this file at the following URL:
        `https://[your-dietwise-app-url]/.well-known/assetlinks.json`
    *   Ensure this file is publicly accessible.

4.  **Build the Android App:**
    *   Once initialized and `assetlinks.json` is correctly hosted, build the app:
        ```bash
        bubblewrap build
        ```
    *   This command will generate:
        *   An Android App Bundle (`app-release.aab`) - This is the recommended format for publishing on Google Play.
        *   A signed APK (`app-release-signed.apk`) - Useful for direct testing.
    *   **Signing Key:**
        *   Bubblewrap will guide you to create a signing key if you don't have one. **Crucially, back up this signing key (`signing-key.keystore`) and its passwords securely.** You will need the exact same key to publish any updates to your app. Losing it means you cannot update your app under the same listing.

5.  **Test Your App:**
    *   Install the generated APK (`app-release-signed.apk`) on an Android device or emulator.
    *   Test thoroughly: startup, navigation, PWA features, offline access, camera permission for UPC scanning.

6.  **Publish to Google Play Store:**
    *   Create a Google Play Developer account (if you don't have one; a one-time fee applies).
    *   In the Google Play Console, create a new app.
    *   Fill in all the store listing details (app title, descriptions, screenshots, feature graphic, privacy policy, content rating, etc.).
    *   Upload your Android App Bundle (`app-release.aab`) to a release track (e.g., internal testing, closed testing, open testing, or production).
    *   Address any policy warnings or errors from Google Play.
    *   Roll out your app.

### Camera Permission for TWA:
Your `metadata.json` includes `"requestFramePermissions": ["camera"]` for AI Studio. For a TWA, camera permission used by `useCameraBarcodeScanner.ts` (via `navigator.mediaDevices.getUserMedia`) needs to be handled:
*   Modern TWAs support permission delegation. When your PWA requests camera permission, the TWA should prompt the user for native Android permission.
*   Bubblewrap typically configures the `AndroidManifest.xml` correctly based on standard web permission requests. Ensure your PWA correctly requests camera access using web APIs.

## 3. iOS App Store Deployment

Deploying a PWA directly to the Apple App Store with full native features and store listing is more complex than with Android's TWA.

*   **"Add to Home Screen":** iOS Safari supports "Add to Home Screen" for PWAs, which provides an app-like icon on the home screen and a near full-screen experience. This is the simplest way for iOS users to "install" your PWA.
*   **Limitations:** Features like push notifications have historically been more limited for PWAs on iOS compared to native apps or Android PWAs, though this is evolving.
*   **Native Wrapper (Advanced):** To get a full App Store listing and deeper native integration on iOS, you would typically need to wrap your PWA in a `WKWebView`-based native Swift or Objective-C application. This is a more involved development process and falls outside the scope of simple PWA deployment. Tools like Apache Cordova or Capacitor could be explored if this route is necessary, but they add complexity.

## 4. Important Considerations

*   **API Key Management:** As mentioned in PWA deployment, the `process.env.API_KEY` for Gemini must be securely handled in your deployment environment. For TWA, the PWA it loads is still a web app, so the same considerations apply. The Android app itself doesn't directly manage this key; the web content it loads does.
*   **Updating Your App:**
    *   **Web Content (PWA):** Most updates (UI, features, bug fixes within the web app) are done by simply deploying the new version of your web files (HTML, JS, CSS, `sw.js`). Users will get the update the next time they open the app and the service worker updates.
    *   **TWA Wrapper:** You only need to rebuild and resubmit the TWA through Bubblewrap and the Play Console if you change native Android configurations (e.g., app icon, app name, Android permissions not delegated, target SDK version).
*   **App Store Policies:** Ensure your app (both the PWA content and the TWA wrapper) adheres to all Google Play Store and Apple App Store (if applicable) policies.
*   **Analytics:** Continue using `analyticsService.ts` for tracking. Events will be fired from the PWA, whether accessed directly or through the TWA.

This guide provides a foundational approach to deploying DietWise. Specific configurations may vary based on your chosen hosting providers and tools.
      