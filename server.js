const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/api/status", (_req, res) => {
  res.json({
    apify: Boolean(process.env.APIFY_TOKEN),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    grok: Boolean(process.env.XAI_API_KEY)
  });
});

const actorId = (process.env.APIFY_ACTOR_ID || "apify~instagram-scraper").replace("/", "~");

async function runApify(input) {
  if (!process.env.APIFY_TOKEN) throw new Error("Add APIFY_TOKEN in Render environment variables.");
  const start = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${process.env.APIFY_TOKEN}&waitForFinish=120`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const run = await start.json();
  if (!start.ok || !run.data) throw new Error(run.error?.message || "Apify run could not start.");
  const datasetId = run.data.defaultDatasetId;
  const result = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_TOKEN}&clean=true&format=json`);
  const items = await result.json();
  if (!result.ok) throw new Error("Could not read Apify results.");
  return Array.isArray(items) ? items : [];
}

app.get("/api/profile/:username", async (req, res) => {
  try {
    const username = req.params.username.replace(/^@/, "").trim();
    const items = await runApify({ usernames: [username], resultsLimit: 1 });
    const p = items[0] || {};
    res.json({
      username: p.username || username,
      fullName: p.fullName || p.name || username,
      biography: p.biography || p.bio || "",
      profilePicUrl: p.profilePicUrlHD || p.profilePicUrl || "",
      followers: p.followersCount ?? p.followers ?? null,
      following: p.followsCount ?? p.following ?? null,
      postsCount: p.postsCount ?? p.mediaCount ?? null,
      isPrivate: Boolean(p.private),
      rawAvailable: Boolean(items.length)
    });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get("/api/posts/:username", async (req, res) => {
  try {
    const username = req.params.username.replace(/^@/, "").trim();
    const items = await runApify({ username, resultsLimit: Math.min(Number(req.query.limit) || 12, 30) });
    res.json(items.map((p, i) => ({
      id: p.id || p.shortCode || `${username}-${i}`,
      type: p.type || "Image",
      caption: p.caption || "",
      displayUrl: p.displayUrl || p.imageUrl || p.thumbnailUrl || "",
      videoUrl: p.videoUrl || "",
      likes: p.likesCount ?? null,
      comments: p.commentsCount ?? null,
      timestamp: p.timestamp || null,
      permalink: p.url || ""
    })));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

async function askGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Add GEMINI_API_KEY in Render environment variables.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || "Gemini request failed.");
  return data.candidates?.[0]?.content?.parts?.map(x => x.text || "").join("\n") || "No response returned.";
}

async function askGrok(prompt) {
  if (!process.env.XAI_API_KEY) throw new Error("Grok is not configured.");
  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.XAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.XAI_MODEL || "grok-3-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || "Grok request failed.");
  return data.choices?.[0]?.message?.content || "No response returned.";
}

app.post("/api/insights", async (req, res) => {
  try {
    const { prompt, provider = "gemini" } = req.body || {};
    if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "Enter an insights prompt." });
    const result = provider === "grok" ? await askGrok(prompt) : await askGemini(prompt);
    res.json({ result, provider, simulated: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.listen(PORT, () => console.log(`Orbit Social running on ${PORT}`));
