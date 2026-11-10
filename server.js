import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const cleanUser = (v = "") => String(v).trim().replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, "").slice(0, 30);

async function apify(input) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not configured.");
  const actor = (process.env.APIFY_ACTOR_ID || "apify~instagram-scraper").replace("/", "~");
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=120&memory=1024`;
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `Apify HTTP ${r.status}`);
  return Array.isArray(data) ? data : [];
}

app.get("/api/status", (_req, res) => res.json({
  apify: Boolean(process.env.APIFY_TOKEN),
  gemini: Boolean(process.env.GEMINI_API_KEY),
  grok: Boolean(process.env.XAI_API_KEY)
}));

app.get("/api/profile/:username", async (req, res) => {
  const username = cleanUser(req.params.username);
  if (!username) return res.status(400).json({ error: "Enter a valid public username." });
  try {
    const rows = await apify({ directUrls: [`https://www.instagram.com/${username}/`], resultsType: "details", resultsLimit: 1 });
    const p = rows[0] || {};
    if (!Object.keys(p).length) return res.status(404).json({ error: "No public profile data returned." });
    res.json({
      username: p.username || username, fullName: p.fullName || p.full_name || "",
      biography: p.biography || p.bio || "", followers: p.followersCount ?? p.followers ?? null,
      following: p.followsCount ?? p.following ?? null, posts: p.postsCount ?? p.posts ?? null,
      verified: Boolean(p.verified), private: Boolean(p.private),
      profilePic: p.profilePicUrlHD || p.profilePicUrl || "", externalUrl: p.externalUrl || ""
    });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

app.get("/api/posts/:username", async (req, res) => {
  const username = cleanUser(req.params.username);
  if (!username) return res.status(400).json({ error: "Enter a valid public username." });
  try {
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 15));
    const rows = await apify({ directUrls: [`https://www.instagram.com/${username}/`], resultsType: "posts", resultsLimit: limit });
    res.json({ posts: rows.map((p, i) => ({
      id: p.id || p.shortCode || String(i), shortcode: p.shortCode || "", type: p.type || "post",
      caption: p.caption || "", likes: p.likesCount ?? p.likes ?? 0, comments: p.commentsCount ?? p.comments ?? 0,
      views: p.videoViewCount ?? p.videoPlayCount ?? 0, image: p.displayUrl || p.thumbnailUrl || p.imageUrl || "",
      video: p.videoUrl || "", url: p.url || "", timestamp: p.timestamp || ""
    })) });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

async function ai(prompt, provider = "auto") {
  const tryGemini = provider !== "grok" && Boolean(process.env.GEMINI_API_KEY);
  if (tryGemini) {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return j.candidates?.[0]?.content?.parts?.map(x => x.text).join("\n") || "No AI response.";
    if (provider === "gemini" || !process.env.XAI_API_KEY) throw new Error(j?.error?.message || "Gemini request failed.");
  }
  if (process.env.XAI_API_KEY) {
    const r = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.XAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.XAI_MODEL || "grok-3-mini", messages: [{ role: "user", content: prompt }], temperature: 0.4 })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error?.message || "Grok request failed.");
    return j.choices?.[0]?.message?.content || "No AI response.";
  }
  throw new Error("Configure Gemini or Grok API key.");
}

app.post("/api/insights", async (req, res) => {
  const { username, profile, posts, provider = "auto" } = req.body || {};
  if (!Array.isArray(posts) || !posts.length) return res.status(400).json({ error: "Load public posts before generating insights." });
  try {
    const sample = posts.slice(0, 25).map(p => ({ caption: String(p.caption || "").slice(0, 400), likes: Number(p.likes) || 0, comments: Number(p.comments) || 0, views: Number(p.views) || 0, type: p.type || "post" }));
    const prompt = `Analyse only the supplied public Instagram data. Do not invent demographics, reach, saves or hidden metrics. Give a concise account snapshot, strongest content patterns, weak spots, five experiments and data limitations. Username: @${cleanUser(username)}. Profile: ${JSON.stringify(profile || {})}. Posts: ${JSON.stringify(sample)}`;
    res.json({ text: await ai(prompt, provider) });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Orbit Social v2 running on ${port}`));