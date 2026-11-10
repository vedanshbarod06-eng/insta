# Orbit Social v4
Independent mobile-first PWA prototype. Not affiliated with Instagram or Google Play.

## Features
- Store-style launch screen
- Home, Reels, Explore/public profile import, Profile
- Professional dashboard, Account Insights, Reel Insights (Overview / Engagement / Audience)
- Manual metric editor for views, reach, likes, comments, shares, saves, watch time, follows, skip rate, follower splits, retention and top locations
- Gemini/Grok metric generation, with generated values editable afterwards
- API connection status

## Render
Build: `npm install`
Start: `npm start`
Runtime: Node
Root directory: blank

## Environment variables
`APIFY_TOKEN` (public profile/post import)
`APIFY_ACTOR_ID` optional, default `apify~instagram-scraper`
`GEMINI_API_KEY` (Gemini)
`GEMINI_MODEL` optional, default `gemini-2.5-flash`
`XAI_API_KEY` (Grok)
`XAI_MODEL` optional, default `grok-3-mini`

Set keys only in Render Environment. Do not commit secrets.
Apify actor input formats can vary; adjust `scrape()` in `server.js` if your selected actor expects a different input schema.

## Data note
Analytics are simulated/editable values. They are not represented as genuine Instagram-reported analytics. Public profile scraping cannot access private account data.
