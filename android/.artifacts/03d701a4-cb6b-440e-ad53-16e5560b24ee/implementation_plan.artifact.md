# Implementation Plan - App Finalization, Updates & Logo

This plan will configure the new `logo.png` as the app icon, fix persistent connectivity issues by aligning the App IDs, and add a mechanism for update notifications.

## User Review Required

> [!IMPORTANT]
> **App ID Alignment**: Your Android Package ID is `com.koikoiblog.app`. I will update the Capacitor configuration to match this exactly. This is critical for the app to load its settings correctly at runtime.

> [!NOTE]
> **Icon Update**: I will set the app to use `@drawable/logo` for both standard and round icons.

## Proposed Changes

### [Android Configuration]

#### [MODIFY] [AndroidManifest.xml](file:///C:/Users/USER/AndroidStudioProjects/blog-frontend/android/app/src/main/AndroidManifest.xml)
- Change `android:icon` and `android:roundIcon` to `@drawable/logo`.
- Add `ACCESS_NETWORK_STATE` permission.
- Link `network_security_config`.

#### [NEW] [network_security_config.xml](file:///C:/Users/USER/AndroidStudioProjects/blog-frontend/android/app/src/main/res/xml/network_security_config.xml)
- Explicitly trust the Render.com backend.

### [Capacitor Configuration]

#### [MODIFY] [capacitor.config.ts](file:///C:/Users/USER/AndroidStudioProjects/blog-frontend/capacitor.config.ts)
- Update `appId` to `com.koikoiblog.app`.
- Re-enable `CapacitorHttp` to bypass CORS natively.

### [Web App Logic]

#### [MODIFY] [App.js](file:///C:/Users/USER/AndroidStudioProjects/blog-frontend/src/App.js)
- Implement an update check that compares the local `package.json` version with a remote version.
- Alert the user when an update is detected.

## Verification Plan

### Manual Verification
1. Deploy the app.
2. Verify the app icon has changed on the device home screen.
3. Check Logcat for successful native fetch calls (`Handling CapacitorHttp request`).
4. Verify the update notification appears if the server version is higher.
