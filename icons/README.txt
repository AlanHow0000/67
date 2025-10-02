Place the following PNGs in this folder for proper PWA install icons:

Required files:
- icon-192x192.png (exactly 192x192)
- icon-512x512.png (exactly 512x512)
- icon-maskable-512x512.png (exactly 512x512, maskable-safe with padding)

Guidelines:
- Use a square canvas with transparent background where possible.
- For the maskable icon, keep key artwork centered with generous padding; avoid text to prevent clipping on Android.
- Test install on Android and desktop Chrome to verify appearance.

After adding/replacing icons:
1) Bump the service worker cache name in `service-worker.js` (e.g., clea-app-cache-v2).
2) Hard refresh in the browser (Ctrl+F5) or unregister the old service worker from DevTools > Application > Service Workers.
