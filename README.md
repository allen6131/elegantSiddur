# simpleSiddur

This repository now contains a modern React Native replacement app built with Expo in `mobile/`.
The legacy Ionic/Cordova app files remain in the root for reference during migration.

## New App (Expo + React Native)

### Location
- `mobile/`

### Requirements
- Node.js 20+ (tested with Node 22)
- npm

### Install

```bash
cd mobile
npm install
```

### Run

```bash
npm run start
```

Then open with Expo Go or an emulator:
- `npm run android`
- `npm run ios` (macOS required for native iOS simulator)

## Offline Siddur Data

The app ships with a bundled offline dataset at:
- `mobile/assets/offline/siddur.offline.v1.json`

This dataset is generated from Sefaria API references and is intended for runtime offline use.

### Rebuild Offline Data

```bash
cd mobile
npm run build:offline-data
```

When generation finishes, the script prints service/section/segment totals and a
deterministic content hash so you can quickly verify whether the bundled content changed.

### Validate Offline Data

```bash
cd mobile
npm run validate:offline-data
```

Validation enforces:
- required services exist
- section and segment IDs are consistent
- Hebrew coverage is complete
- English coverage is reported (warnings are surfaced for known sparse sections)

### Full Local Checks

```bash
cd mobile
npm run check
```

This includes a static runtime-offline verification script that ensures app source files do not introduce network text fetching paths.

## Sefaria Attribution

Prayer text content is sourced from Sefaria and bundled locally for offline usage in this app.
Please review Sefaria's usage terms and attribution requirements for distribution contexts.