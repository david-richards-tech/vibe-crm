# Vibe CRM

This is a standalone Vite + React + TypeScript + Tailwind CSS app. It builds
and runs anywhere with Node.js installed — no platform-specific tooling
required.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`)

## Install

```bash
npm install
```

## Develop

Start the Vite dev server with hot reload:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). The app
knows its own ID and the API host because the platform pre-fills them in
`lib/config.ts` — no environment variables to set.

## Build

Type-check and produce a production bundle in `dist/`:

```bash
npm run build
```

## Preview the production build

```bash
npm run preview
```

## Project layout

```
.
├── index.html            Vite entry HTML
├── index.tsx             React root
├── App.tsx               Top-level component
├── pages/                Route components
├── lib/
│   ├── api.ts            Data API client
│   └── auth.ts           Email + 6-digit code auth (external apps)
├── index.css             Tailwind directives + design tokens
├── tailwind.config.js    Tailwind theme (shadcn/ui style)
├── vite.config.ts        Vite config
├── tsconfig.json         TypeScript config
├── postcss.config.js     PostCSS (Tailwind + autoprefixer)
├── package.json
└── app.json              App manifest (name, entry, tables)
```

## Build for iOS and Android (Capacitor)

[Capacitor](https://capacitorjs.com/) wraps the web build as a native iOS or
Android app. The Vite output in `dist/` is the web asset bundle Capacitor
ships inside the native shell.

### One-time setup

Install Capacitor and initialise the project:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Vibe CRM" com.example.vibecrm --web-dir=dist
```

Replace the name and bundle ID with your own. The `--web-dir=dist` flag points
Capacitor at Vite's build output.

Add the platforms you want to target:

```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

This creates `ios/` and `android/` directories — commit them to source
control.

### Build and run on iOS

Requires macOS with [Xcode](https://developer.apple.com/xcode/) installed.

```bash
npm run build
npx cap sync ios
npx cap open ios
```

The last command opens the project in Xcode. Press the Run button to launch
in the iOS Simulator, or select a connected device. To ship to the App Store,
configure a Team and Bundle Identifier in Xcode's *Signing & Capabilities*
tab, then *Product → Archive*.

### Build and run on Android

Requires [Android Studio](https://developer.android.com/studio) with the
Android SDK installed.

```bash
npm run build
npx cap sync android
npx cap open android
```

Android Studio will open the project. Press Run to launch on an emulator or
connected device. To ship to Google Play, use *Build → Generate Signed
Bundle / APK* and follow the signing wizard.

### After every code change

Rebuild the web bundle and sync it into the native projects:

```bash
npm run build
npx cap sync
```

For day-to-day iteration on the web side you can keep using `npm run dev` —
only run `cap sync` when you want the change reflected in the native shell.

## Notes

- **Auth and data:** `lib/auth.ts` and `lib/api.ts` talk to the hosted backend
  by default. On a native device they work the same way as in a browser, as
  long as the device has internet access.
- **Static hosting:** the `dist/` folder can also be uploaded to any static
  host (Netlify, Vercel, Cloudflare Pages, S3, etc.) for plain web
  deployment.
