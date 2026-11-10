# Orbit Social v3

Independent mobile-first PWA prototype. It uses an app-discovery entry screen, then a focused social interface.

## Included
- Home feed, Reels, Explore/public username lookup, Activity, Profile
- Professional dashboard and individual Reel Insights tabs
- API status for Apify, Gemini and optional Grok
- Public profile/post lookup through an Apify actor
- AI-generated insight commentary (clearly labelled as simulated/estimated)

## Not included
No DMs, Story creation, private-account access, Instagram login/session cookies, or private Instagram analytics. Public scraping does not provide reliable audience demographics or first-party Reel analytics.

## Render
- Build command: `npm install`
- Start command: `npm start`
- Runtime: Node
- Root directory: leave blank

## Environment variables
- `APIFY_TOKEN` required for public profile/post lookups
- `APIFY_ACTOR_ID` optional; default `apify~instagram-scraper`
- `GEMINI_API_KEY` optional for Gemini insights
- `GEMINI_MODEL` optional; default `gemini-2.5-flash`
- `XAI_API_KEY` optional for Grok
- `XAI_MODEL` optional; default `grok-3-mini`

Set secrets in Render Environment, never in GitHub.

## Important
The Apify actor input schema can vary. If your selected actor uses a different input format, adjust `runApify()` in `server.js`. This is an independent prototype, not affiliated with Instagram or Google Play.
