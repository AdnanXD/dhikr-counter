# Dhikr Counter (PWA)

A free, ad-free dhikr / tasbih counter. One self-contained page (`index.html`, fonts embedded) plus a manifest and a service worker so it installs and works offline. For https://dhikr-counter-gamma.vercel.app, hosted on Vercel as a plain static site (no build step). The Android app is a Trusted Web Activity wrapper around the same site.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | The app (v5) plus SEO tags, JSON-LD, hidden summary, service worker registration |
| `privacy.html` | Plain-English privacy page, linked from the info panel |
| `manifest.webmanifest` | Install metadata (name, colours, icons) |
| `sw.js` | Offline service worker (precache, network-first pages, cache-first assets) |
| `icon-192/512.png`, `maskable-192/512.png` | Manifest icons |
| `apple-touch-icon.png`, `favicon-32.png`, `favicon.svg` | Browser and iOS icons |
| `icon-play-512.png` | Play Store hi-res icon (no transparency) |
| `og-image.png` | 1200x630 social preview |
| `robots.txt`, `sitemap.xml` | Search engines |
| `vercel.json` | Headers: CSP, nosniff, referrer policy, cache and content types |
| `.well-known/assetlinks.json` | Digital Asset Links for the Android app (placeholder fingerprint) |

## Deploy

1. Push this folder to a Git repo and import it in Vercel (Framework: Other, no build command, output directory `.`), or run `vercel --prod` inside the folder.
2. Add the domain `dhikr-counter-gamma.vercel.app` in the Vercel project settings.
3. Replace `REPLACE_WITH_PLAY_APP_SIGNING_SHA256` in `.well-known/assetlinks.json` with the SHA-256 certificate fingerprint from Play Console (App signing).

## Updating the app

Any change to a precached file needs two follow-ups:

1. **Bump the cache version** in `sw.js` (`var CACHE = 'dhikr-v5-1'`, for example to `'dhikr-v5-2'`). Installed copies then fetch the new files and delete the old cache. Visitors online get new pages on their next visit anyway (navigation is network-first), but the version bump refreshes the cached icons and manifest.
2. **If you edit either inline `<script>` in `index.html`, refresh the CSP hashes** in `vercel.json`. The Content-Security-Policy allows only those two scripts by hash, so an edited script will not run until its hash is updated. Print the new hashes with:

```
python3 - <<'PY'
import re, hashlib, base64
s = open('index.html').read()
for m in re.finditer(r'<script>(.*?)</script>', s, re.S):
    print("'sha256-" + base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode() + "'")
PY
```

and paste them into the `script-src` list. Changes to CSS, text or other files do not need new hashes.

Add any new file that must work offline to the `PRECACHE` list in `sw.js`.
