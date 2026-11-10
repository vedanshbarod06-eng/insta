# Orbit Social

An installable PWA for looking up **public** Instagram profiles/posts through an Apify actor and generating analysis with Gemini (Grok fallback). No app login, access-key gate, Instagram password, or session-cookie collection.

## Important limitations
- This is an independent client/research tool, not Instagram and not affiliated with Meta.
- It does not access private accounts, DMs, stories restricted to followers, or Instagram's private APIs.
- Apify actor output/input varies by actor version. The default is `apify~instagram-scraper`; if your Apify account uses another actor, set `APIFY_ACTOR_ID` and adjust its input in `server.js` to match that actor's documented schema.
- Real Instagram data requires a working Apify subscription/token and must follow Instagram/Apify terms and applicable law. Public scraping can break when Instagram changes its site or limits access.
- AI analysis only analyses the public post/profile fields returned by the scraper. It cannot truthfully infer private audience demographics or reach metrics that were not returned.

## Run locally
Requires Node.js 20+.

```bash
npm install
cp .env.example .env
# Add keys to .env (do not commit it)
npm start
```

Open `http://localhost:3000`.

## Deploy from an Android phone (Render)
1. Upload this project to a private GitHub repository using github.com in your phone browser (or GitHub mobile app).
2. On render.com, create **New + → Web Service**, connect that repository.
3. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
4. In Render → Environment, add `APIFY_TOKEN`, `GEMINI_API_KEY`, and `XAI_API_KEY`. Optionally set `APIFY_ACTOR_ID`, `GEMINI_MODEL`, `XAI_MODEL`.
5. Deploy. Open the Render URL in Chrome on Android → ⋮ → **Add to Home screen** / **Install app**.

## API routes
- `GET /api/status` — reports whether server secrets are configured (never returns secret values).
- `GET /api/profile/:username` — fetches one public profile.
- `GET /api/posts/:username?limit=12` — fetches recent public posts.
- `POST /api/insights` — analyses supplied profile/post data with Gemini, then Grok if Gemini is not configured.

## Security
Secrets are read only from server environment variables. Do not put API keys in frontend code, screenshots, GitHub, or chat. Add rate limiting and per-user abuse controls before exposing a public deployment to strangers; this starter is intended for personal use.
