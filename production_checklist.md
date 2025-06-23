# 🧾 README — Unified MCP-Powered Project Toolchain

This project uses **appmcp** to manage and orchestrate all platform-specific and shared CLI tools across Android, iOS, Web, Roblox (Vibe Blocks), and CI environments. It defines and executes tasks consistently across local, Docker, and CI workflows using shell scripts, platform tags, and GitHub Actions.

## 🔧 How it Works

* Tools are registered per platform using `appmcp add`
* Tools are grouped by project type: `--platform android`, `--platform web`, etc.
* Local tools are stored in `.appmcp.local.json` (gitignored), project-wide tools in `.appmcp.json`
* Codex + ESLint integration ensures production-quality linting
* Vibe Blocks Roblox CI is handled via appmcp + GitHub Actions
* MCP commands can be executed locally or from Docker

---

# ✅ Unified Production, Testing, and Deployment Checklist for Dietwise

**Project:** Dietwise
**Publisher:** Wizard Tech LLC
**Maintainer:** Jason Evenson
**Environment:** WSL + Netlify + iOS/Android + Node.js/TS + Vite + Supabase

---

## 🔧 Backend (Node/Express + TypeScript)

*

## 🧪 Testing (Vitest + Playwright + Shell)

*

```sh
#!/bin/bash

mkdir -p audit

echo "🔍 Running lint..."
npx eslint . || exit 1

echo "🧪 Running unit tests..."
vitest run --coverage || exit 1

echo "🧪 Running E2E tests..."
PWDEBUG=0 npm run test:e2e || exit 1

echo "🧪 Running CLI test runner..."
./test-runner.sh || exit 1

echo "✅ All test phases passed."
```

*

## 📱 Mobile (iOS/Android + Capacitor)

*

## 🔐 Secrets & Security

### 🐧 Linux-Specific Notes for appmcp & Claude Integration

*

```sh
sudo apt update && sudo apt install python3 python3-venv
```

*

```sh
python3 -m venv ~/.claude-env
source ~/.claude-env/bin/activate
pip install mcp[cli]
```

*

```sh
chmod +x appmcp.py
```

*

```python
#!/usr/bin/env python3
```

* \#!/usr/bin/env python3

```sh
if [ -d "$HOME/.local/bin" ]; then
  export PATH="$HOME/.local/bin:$PATH"
fi
```

Add this to `.bashrc` or `.zshrc` and `source ~/.bashrc` after updating.

*

```sh
python3 -m venv ~/.claude-env
source ~/.claude-env/bin/activate
pip install mcp[cli]
```

* Run MCP commands using full path: `~/.claude-env/bin/mcp`

```sh
mcp --help
```

* Review MCP capabilities via Claude or Codex session discovery when CLI fails for Gemini and Claude access:
* Add custom key for GitHub/Gemini repo access
* Ensure `Host github.com` block points to the correct IdentityFile

```sh
python3 -m venv ~/.claude-env
source ~/.claude-env/bin/activate
pip install mcp[cli]
```

* Run MCP commands using full path: `~/.claude-env/bin/mcp`
*

## 🛠 Build, Lint, and Quality Gate

### 🔁 Codex ESLint Fix Review Queue (Prompt Chain)

For full control and review during Codex refactoring, use this **interactive prompt chain** that pauses after each file:

```sh
codex run --prompt "
Iterate through each of the following files one at a time. After fixing the file, stop and ask: '✅ Ready to continue to the next file?'

Rules:
- Fix all @typescript-eslint/no-unused-vars issues
- Rename unused parameters (e.g., err → _err)
- Remove unused imports or variables
- If variable may be used later, rename to _name and add // TODO
- Preserve unused test scaffolding only with // TODO

List:
components/FoodLog.tsx
components/MealIdeaSuggestion.tsx
components/MyLibraryComponent.tsx
components/SplashScreen.tsx
components/UserProfileForm.tsx
components/UserStatusDashboard.tsx
components/WeightChartComponent.tsx
components/WeightLogFormComponent.tsx
components/common/ErrorBoundary.tsx
constants.ts
hooks/useCameraBarcodeScanner.ts
hooks/useSplashScreen.ts
services/api/auth.ts
src/App.tsx
src/customer-success/healthScore.ts
src/finance/revenueOptimization.ts
src/seo/contentStrategy.ts
src/utils/dataLimits.ts
tests/e2e/bulletproof-test.spec.ts
tests/e2e/full-user-journey.spec.ts
tests/e2e/mobile-features.spec.ts
tests/unit/UserProfileForm.test.tsx

Only return the full, fixed content for one file at a time.
Stop and wait for a go-ahead after each before continuing."
```

To resolve all `@typescript-eslint/no-unused-vars` warnings without model failure:

**Use the following Codex prompt per file:**

```sh
codex review <file> --prompt "Identify and fix all @typescript-eslint/no-unused-vars issues. Rename unused parameters with a leading underscore. Remove unused imports. Rename placeholders with _var and add // TODO comments if future use is intended. Return a clean, complete block."
```

**Files to review in this order:**

1. backend/src/middleware/auth.middleware.ts
2. backend/src/middleware/errorHandler.ts
3. components/AdvancedAnalytics.tsx
4. components/FoodLog.tsx
5. components/MealIdeaSuggestion.tsx
6. components/MyLibraryComponent.tsx
7. components/SplashScreen.tsx
8. components/UserProfileForm.tsx
9. components/UserStatusDashboard.tsx
10. components/WeightChartComponent.tsx
11. components/WeightLogFormComponent.tsx
12. components/common/ErrorBoundary.tsx
13. constants.ts
14. hooks/useCameraBarcodeScanner.ts
15. hooks/useSplashScreen.ts
16. services/api/auth.ts
17. src/App.tsx
18. src/customer-success/healthScore.ts
19. src/finance/revenueOptimization.ts
20. src/seo/contentStrategy.ts
21. src/utils/dataLimits.ts
22. tests/e2e/bulletproof-test.spec.ts
23. tests/e2e/full-user-journey.spec.ts
24. tests/e2e/mobile-features.spec.ts
25. tests/unit/UserProfileForm.test.tsx

*

```js
import reactHooks from 'eslint-plugin-react-hooks';
...
plugins: {
  'react-hooks': reactHooks
},
rules: {
  'react-hooks/exhaustive-deps': 'warn'
}
```

*

## 🧾 Documentation & Reports

## 🧰 Suggested appmcp Tool Definitions by Domain

### 🧭 MCP Toolset Categories

You can define and invoke these tool sets independently based on project type:

| Category                | Platform Tag | Example Projects                                  |
| ----------------------- | ------------ | ------------------------------------------------- |
| Android CI / Play Store | `android`    | mobile-only apps, Capacitor hybrid apps           |
| iOS CI / TestFlight     | `ios`        | Swift, Fastlane, or Capacitor iOS apps            |
| Web Dev & Deployment    | `web`        | Vite apps, React/Next, Supabase, Firebase         |
| Roblox Game Dev         | `roblox`     | Vibe Blocks, Rojo, Foreman, TestEZ                |
| CLI & System Utilities  | `common`     | Docker, Git, changelog, CI scripts                |
| Desktop & Electron      | `desktop`    | Tauri, Electron, NW\.js projects                  |
| Backend & Server Ops    | `backend`    | Node.js APIs, Python FastAPI, Flask, etc.         |
| Infrastructure & DevOps | `infra`      | Terraform, AWS CLI, Pulumi, Ansible               |
| Data & Analytics        | `data`       | Supabase CLI, Prisma, pgcli, db migrations        |
| Docs & QA               | `docs`       | mkdocs, docsify, TestRail CLI, snapshot workflows |

Use `--platform` to define and filter tools, and define new groups like:

```sh
appmcp add backend-db-migrate "npx prisma migrate deploy" -p backend --scope project
appmcp add docs-publish "mkdocs gh-deploy" -p docs --scope project
```

Now each project can call only the tools that apply to its context using:

```sh
appmcp list --platform roblox
appmcp run web-build-prod
```

💡 Want full coverage? Add CI/CD pipelines, test reporting tools (e.g., TestRail CLI), analytics integration (e.g., Segment), containerization scripts, and observability (e.g., Sentry CLI, Datadog agents). Extend platform coverage to desktop (Electron), cloud (AWS CLI, Terraform), and data tools (Supabase CLI, Prisma, pgcli).

### 🧠 How to Implement Tool Sets via appmcp

#### 🛠️ Run This Setup Script to Install All Tools

Create `register-appmcp-tools.sh` in your project root:

```sh
#!/bin/bash

# Android tools
appmcp add android-build-debug "./gradlew assembleDebug" -p android --scope project --description "Builds debug APK"
appmcp add android-install-debug "./gradlew installDebug" -p android --scope project --description "Installs APK"
appmcp add android-run-tests-unit "./gradlew testDebugUnitTest" -p android --scope project
appmcp add android-lint "./gradlew lint" -p android --scope project
appmcp add android-clean "./gradlew clean" -p android --scope project

# iOS tools
appmcp add ios-build-debug "xcodebuild -workspace MyApp.xcworkspace -scheme MyAppDebug -sdk iphonesimulator build" -p ios --scope project
appmcp add ios-run-tests-unit "fastlane ios run_unit_tests" -p ios --scope project
appmcp add ios-lint "swiftlint" -p ios --scope project

# Web tools
appmcp add web-dev-server "npm run dev" -p web --scope project
appmcp add web-build-prod "npm run build" -p web --scope project
appmcp add web-test-unit "vitest run" -p web --scope project
appmcp add web-lint "eslint ." -p web --scope project

# Roblox tools
appmcp add roblox-rojo-serve "rojo serve default.project.json" -p roblox --scope project
appmcp add roblox-lint-lua "selene ." -p roblox --scope project

# Common utilities
appmcp add common-git-pull-rebase "git pull --rebase" -p common --scope user
appmcp add common-docker-prune "docker system prune -af" -p common --scope user
```

Make it executable:

```sh
chmod +x register-appmcp-tools.sh
```

Then run it once:

```sh
./register-appmcp-tools.sh
```

You can now run tool sets with `appmcp run <tool-name>` from anywhere in your project.

#### 🔨 1. Register a tool with `appmcp add`

Use the CLI to register a tool:

```sh
appmcp add android-build-debug "./gradlew assembleDebug" -p android --scope project --description "Builds debug APK"
```

Repeat this for every tool you'd like to define from the list below.

#### 🧩 2. View registered tools by domain

Filter tools using:

```sh
appmcp list --platform android
appmcp list --platform web
appmcp list --platform common
```

#### 🚀 3. Run tool sets

You can batch execute a set of tools using:

```sh
appmcp run android-build-debug
appmcp run android-lint
```

Or define composite shell scripts like `run-android-ci.sh` with:

```sh
#!/bin/bash
appmcp run android-clean
appmcp run android-build-debug
appmcp run android-run-tests-unit
```

#### 📦 4. Use `--scope user` for reusable tools

If a tool is useful across many projects (e.g., `docker system prune` or `git pull --rebase`), use:

```sh
appmcp add common-clean-all "./scripts/clean_everything.sh" -p common --scope user
```

#### 🛠 5. Maintain `.appmcp.json` in your project

Each registered tool is stored under the `tools` key. This lets you share tooling by checking in the config file.

#### 🔁 6. Override locally without affecting the project

Use `--scope local` to create overrides in `.appmcp.local.json`, which should be `.gitignore`d by default.

### 📱 Android (Platform: android)

* `android-build-debug`: `./gradlew assembleDebug`
* `android-build-release-apk`: `./gradlew assembleRelease`
* `android-install-debug`: `./gradlew installDebug`
* `android-run-tests-unit`: `./gradlew testDebugUnitTest`
* `android-clean`: `./gradlew clean`
* `android-lint`: `./gradlew lint`
* `android-deploy-playstore-internal`: `fastlane android deploy_internal`

### 🍎 iOS (Platform: ios)

* `ios-build-debug`: `xcodebuild -workspace ...`
* `ios-build-release`: `fastlane ios build_release_app`
* `ios-run-tests-unit`: `fastlane ios run_unit_tests`
* `ios-lint`: `swiftlint`
* `ios-pod-install`: `pod install --repo-update`
* `ios-deploy-testflight`: `fastlane ios upload_to_testflight`

### 🌐 Web (Platform: web)

* `web-dev-server`: `npm run dev`
* `web-build-prod`: `npm run build`
* `web-lint`: `eslint .`
* `web-test-unit`: `vitest run`
* `web-test-e2e`: `playwright test`
* `web-deploy-staging`: `./scripts/deploy_staging.sh`
* `web-db-migrate`: `npx prisma migrate dev`
* `web-clean-build`: `rm -rf dist .next`

### 🕹 Roblox (Platform: roblox)

💡 Includes advanced Roblox tool integration: Vibe Blocks, Rojo, TestEZ, and dev automation.

#### 🧪 Run Vibe Blocks CI Workflow Automatically

Create `run-vibe-ci.sh`:

```sh
#!/bin/bash

set -e

# Run all Vibe Blocks CI tools in order
appmcp run roblox-foreman-install
appmcp run roblox-vibe-lint
appmcp run roblox-vibe-test
appmcp run roblox-vibe-deploy
appmcp run roblox-vibe-publish
```

Then make it executable:

```sh
chmod +x run-vibe-ci.sh
./run-vibe-ci.sh
```

You now have a full CI-like execution flow for Roblox + Vibe Blocks using MCP automation.

#### 🧰 Register Vibe Blocks Tools Automatically

Create `register-vibe-blocks-tools.sh`:

```sh
#!/bin/bash

# Vibe Blocks CLI tool definitions for appmcp
appmcp add roblox-rojo-sync "rojo serve vibe.project.json" -p roblox --scope project --description "Syncs Vibe Blocks with Roblox Studio"
appmcp add roblox-vibe-deploy "rojo build vibe.project.json -o VibeBlocks.rbxlx" -p roblox --scope project --description "Deploys Vibe Blocks as Roblox place file"
appmcp add roblox-vibe-publish "./scripts/publish_vibe_blocks.sh" -p roblox --scope project --description "Custom script to publish Vibe Blocks"
appmcp add roblox-vibe-test "foreman run testez vibe/" -p roblox --scope project --description "Runs Vibe Blocks unit tests"
appmcp add roblox-vibe-lint "stylua vibe/ && selene vibe/" -p roblox --scope project --description "Lints Vibe Blocks Lua scripts"
appmcp add roblox-vibe-analyze "rojo build vibe.project.json --output analyze.json && jq . analyze.json" -p roblox --scope project --description "Analyzes Vibe Blocks Rojo output"
```

Then run:

```sh
chmod +x register-vibe-blocks-tools.sh
./register-vibe-blocks-tools.sh
```

You can now list them with `appmcp list --platform roblox`

* `roblox-rojo-serve`: `rojo serve default.project.json`
* `roblox-rojo-sync`: `rojo serve vibe.project.json` — syncs with Vibe Blocks
* `roblox-vibe-deploy`: `rojo build vibe.project.json -o VibeBlocks.rbxlx` — deploys Vibe Blocks place file
* `roblox-vibe-publish`: `./scripts/publish_vibe_blocks.sh` — custom script to handle Roblox publish automation
* `roblox-vibe-test`: `foreman run testez vibe/` — runs Vibe Blocks tests
* `roblox-vibe-lint`: `stylua vibe/ && selene vibe/` — lints Vibe Blocks scripts
* `roblox-vibe-analyze`: `rojo build vibe.project.json --output analyze.json && jq . analyze.json` — inspects build output structure
* `roblox-foreman-install`: `foreman install`
* `roblox-run-tests`: `foreman run testez .`
* `roblox-lint-lua`: `selene .`
* `roblox-format-lua`: `stylua .`
* `roblox-analyze`: `stylua . && selene .`
* `roblox-deploy-place`: `rojo build default.project.json -o MyPlace.rbxlx`
* `roblox-open-studio`: `start \"\" \"C:\Program Files\Roblox\Versions\<version>\RobloxStudioLauncherBeta.exe\"`

### 🛠 Common / Utility (Platform: common)

* `common-git-pull-rebase`: `git pull --rebase`
* `common-git-commit-standard`: `git commit -m "feat: "`
* `common-clean-all`: `./scripts/clean_everything.sh`
* `common-docker-prune`: `docker system prune -af`

## 🚀 Local Deployment via Docker (Optional Alternative)

### 🐳 Build & Host Locally with Docker

#### 📦 1. Create a Dockerfile in your project root:

```Dockerfile
# Base image with Node.js and optional Python
FROM node:18

# Set work directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Expose port and start the app (adjust based on your stack)
EXPOSE 3000
CMD ["npm", "start"]
```

#### 🧱 2. Build the Docker image

```sh
docker build -t dietwise-app .
```

#### 🚀 3. Run the container

```sh
docker run --rm -p 3000:3000 dietwise-app
```

> ✅ Your app will be available at [http://localhost:3000](http://localhost:3000)

### 🔁 Optional: Run MCP & Codex in Docker

You can also bundle `appmcp.py`, `codex`, and `mcp[cli]` into your Docker image if needed.

---

## 🚀 GitHub Actions Workflow for Vibe Blocks CI

Create `.github/workflows/vibe-ci.yml`:

```yaml
name: Vibe Blocks CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  vibe:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Set up appmcp CLI (virtualenv)
        run: |
          python3 -m venv ~/.claude-env
          source ~/.claude-env/bin/activate
          pip install mcp[cli]
          ln -sf $(pwd)/appmcp.py ~/.local/bin/appmcp

      - name: Register tools (Vibe Blocks)
        run: ./register-vibe-blocks-tools.sh

      - name: Run Vibe CI
        run: ./run-vibe-ci.sh
```

This automates your full Roblox/Vibe Blocks testing + publish pipeline.

## 🚀 Netlify Deployment

*

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "./plugins/check-todos"
```

*

## 🎯 Final Push Strategy

### 🧾 Auto-Regenerate README from Checklist

Create `generate-readme-from-checklist.sh`:

```bash
#!/bin/bash

SOURCE="Production Checklist.md"
TARGET="README-unified.md"

if [[ ! -f "$SOURCE" ]]; then
  echo "❌ Error: $SOURCE not found."
  exit 1
fi

cp "$SOURCE" "$TARGET"
echo "✅ $TARGET successfully regenerated from $SOURCE"
```

Then make it executable:

```sh
chmod +x generate-readme-from-checklist.sh
```

Run it anytime to sync:

```sh
./generate-readme-from-checklist.sh
```

### ✅ Step-by-Step Guide to Fully Execute Production Workflow

#### 🧰 1. Install Dependencies

```sh
npm install
pip install -r requirements.txt  # If using Python tools or MCP-related logic
```

#### 🧪 2. Run All Tests

```sh
chmod +x test-runner.sh
./test-runner.sh
```

#### 🧹 3. Run ESLint & Autofix

```sh
npx eslint . --fix
```

#### 🛠 4. MCP Tool Setup (Linux/WSL)

```sh
python3 -m venv ~/.claude-env
source ~/.claude-env/bin/activate
pip install mcp[cli]
chmod +x appmcp.py
ln -sf $(pwd)/appmcp.py ~/.local/bin/appmcp
```

#### 🧾 5. Add Tools to MCP

```sh
appmcp add android-build-debug "./gradlew assembleDebug" -p android --scope project --description "Builds debug APK"
# Repeat for other tools defined in the checklist
```

#### 🔍 6. Validate MCP CLI

```sh
appmcp list --platform android
appmcp run android-build-debug
```

#### 🔧 7. Lint + Fix All ESLint Warnings with Codex (one-by-one)

```sh
codex review components/MyLibraryComponent.tsx --prompt "Fix all unused var warnings. Add _var or TODO when appropriate."
```

#### 🗂 8. Build Project for Deployment

```sh
npm run build
```

#### 🚀 9. Deploy to Netlify

Netlify will auto-deploy from GitHub if connected. If manual:

```sh
netlify deploy --prod --dir=dist
```

#### 🔁 10. Push Code

```sh
git add .
git commit -m "✅ Production-ready build: cleaned, tested, MCP registered"
git push origin main
```

*

```sh
npm install
npm test
npm run build
```

*

---

*This unified checklist enforces full audit coverage for backend, mobile, testing, secrets, CI, and deployment.*
