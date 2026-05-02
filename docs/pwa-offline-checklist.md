# PWA Offline Checklist

## Scope

This checklist covers the current local PWA and offline draft behavior.

## Pages

- `/dashboard`
- `/visitor/tasks`
- `/visitor/visits/schedule_001`
- `/visitor/drafts`
- `/offline`

## Expected Behavior

1. The service worker registers on supported browsers.
2. Core app shell pages are cached after first visit.
3. `/offline` is shown when a navigation request cannot reach the network and no cached page exists.
4. Visit forms auto-save drafts to localStorage per `schedule_id`.
5. Returning to the same visit page restores the draft.
6. Successful mock submission removes the local draft.
7. `/visitor/drafts` lists unsent local visit drafts.

## Known Limits

- Offline submissions are not queued for later sync yet.
- Attachments, photos, GPS, and signatures are represented by metadata only.
- Service worker behavior can differ between localhost, Safari, and installed PWA contexts.
