# Orbit Social v2

A phone-friendly PWA prototype with a simulated app-store discovery screen and an Instagram-inspired social client.

## Deploy on Render
- Build command: `npm install`
- Start command: `npm start`
- Runtime: Node
- Root directory: leave blank

## Environment variables
- `APIFY_TOKEN` required for public profile/post lookups
- `APIFY_ACTOR_ID` optional; defaults to `apify~instagram-scraper`
- `GEMINI_API_KEY` for Gemini insights
- `GEMINI_MODEL` optional; defaults to `gemini-2.5-flash`
- `XAI_API_KEY` optional Grok fallback
- `XAI_MODEL` optional; defaults to `grok-3-mini`

The frontend is served from the repository root. Do not upload real API keys to GitHub.

## Limitations
This is an independent prototype, not Instagram or Google Play. Store content and social interactions are simulated. Public profile/posts are fetched via the configured Apify actor. It does not provide private account access, DMs, private stories, follows, likes, or official Instagram account authentication. API actor input may need adjustment for the actor configured in your Apify account.
