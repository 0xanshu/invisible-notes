# Releasing Ghost Notes

## Current state (be honest about this)

Pushing a `v*` tag triggers `.github/workflows/release.yml`, which builds a macOS universal `.dmg`/`.zip` and a Windows NSIS installer and attaches them to a GitHub Release. **Neither build is currently code-signed or notarized** — no Apple Developer or Windows code-signing certificate is configured in this environment. Until that's set up:

- **macOS**: users seeing "Ghost Notes.app is damaged / from an unidentified developer" is expected. They can right-click → Open, or `xattr -cr /Applications/Ghost\ Notes.app`, to bypass Gatekeeper on an unsigned/unnotarized build.
- **Windows**: SmartScreen will warn "Windows protected your PC" on first run. Users need "More info" → "Run anyway".

This is a real limitation, not a bug — fix it by adding the secrets below.

## To sign & notarize macOS builds

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/yr).
2. Create a **Developer ID Application** certificate in Xcode or the Apple Developer portal, export it as a `.p12` file with a password.
3. Base64-encode it: `base64 -i DeveloperID.p12 | pbcopy`
4. Add these repo secrets (Settings → Secrets and variables → Actions):
   - `MAC_CSC_LINK` — the base64 `.p12` contents
   - `MAC_CSC_KEY_PASSWORD` — the `.p12` export password
   - `APPLE_ID` — your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` — an [app-specific password](https://support.apple.com/en-us/102654) for that Apple ID
   - `APPLE_TEAM_ID` — your Apple Developer Team ID

electron-builder auto-signs and auto-notarizes when these are present (`build/entitlements.mac.plist` and `hardenedRuntime: true` are already configured in `package.json`) — but you must also **remove `"identity": null` from `package.json`'s `build.mac` block first**. It's there to force-skip signing on CI runners, which otherwise pick up a stray ambient keychain identity and fail the build with no password to use. Leaving it in place after adding real certs will keep builds unsigned.

## To sign Windows builds

1. Buy a code-signing certificate (EV or standard OV) from a CA (DigiCert, SSL.com, etc.) — EV avoids SmartScreen reputation warnings almost immediately, OV takes longer to build reputation.
2. Export it as a `.pfx`, base64-encode it.
3. Add repo secrets:
   - `WIN_CSC_LINK` — base64 `.pfx` contents
   - `WIN_CSC_KEY_PASSWORD` — the `.pfx` password

No other changes needed — the workflow already passes these through.

## Cutting a release

```bash
npm version patch   # or minor / major — updates package.json + creates a git tag
git push && git push --tags
```

The tag push triggers the build/publish workflow. The website (`docs/`) reads the latest GitHub Release via the GitHub API at page-load time, so it never needs updating for a new version — no hardcoded download URLs anywhere.

## Auto-updates (not implemented yet)

`build.publish` is already set to `{ "provider": "github" }`, which is the prerequisite for `electron-updater`. To add in-app auto-updates later: install `electron-updater`, call `autoUpdater.checkForUpdatesAndNotify()` on launch. Not added now to avoid over-engineering a first release — but nothing here needs to change to add it.
