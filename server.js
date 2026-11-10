const express=require("express"),path=require("path");
const app=express(),PORT=process.env.PORT||3000;
app.use(express.json({limit:"1mb"}));app.use(express.static(__dirname));
app.get("/api/status",(_,res)=>res.json({apify:!!process.env.APIFY_TOKEN,gemini:!!process.env.GEMINI_API_KEY,grok:!!process.env.XAI_API_KEY}));
const actor=(process.env.APIFY_ACTOR_ID||"apify~instagram-scraper").replace("/", "~");
async function scrape(input){
 if(!process.env.APIFY_TOKEN)throw Error("APIFY_TOKEN is missing in Render environment variables.");
 const r=await fetch(`https://api.apify.com/v2/acts/${actor}/runs?token=${process.env.APIFY_TOKEN}&waitForFinish=120`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
 const d=await r.json();if(!r.ok||!d.data)throw Error(d.error?.message||"Apify run failed.");
 const q=await fetch(`https://api.apify.com/v2/datasets/${d.data.defaultDatasetId}/items?token=${process.env.APIFY_TOKEN}&clean=true&format=json`);
 const items=await q.json();if(!q.ok)throw Error("Could not read Apify dataset.");return Array.isArray(items)?items:[];
}
app.get("/api/profile/:username",async(req,res)=>{try{
 const u=req.params.username.replace(/^@/,"").trim(),items=await scrape({usernames:[u],resultsLimit:1}),p=items[0]||{};
 res.json({username:p.username||u,fullName:p.fullName||p.name||u,biography:p.biography||p.bio||"",profilePicUrl:p.profilePicUrlHD||p.profilePicUrl||"",followers:p.followersCount??p.followers??0,following:p.followsCount??p.following??0,postsCount:p.postsCount??p.mediaCount??0});
}catch(e){res.status(400).json({error:e.message})}});
app.get("/api/posts/:username",async(req,res)=>{try{
 const u=req.params.username.replace(/^@/,"").trim(),items=await scrape({username:u,resultsLimit:Math.min(Number(req.query.limit)||18,30)});
 res.json(items.map((p,i)=>({id:p.id||p.shortCode||`${u}-${i}`,type:p.type||"Image",caption:p.caption||"",displayUrl:p.displayUrl||p.imageUrl||p.thumbnailUrl||"",videoUrl:p.videoUrl||"",likes:p.likesCount??0,comments:p.commentsCount??0,url:p.url||""})));
}catch(e){res.status(400).json({error:e.message})}});
async function ai(provider,prompt){
 if(provider==="grok"){
  if(!process.env.XAI_API_KEY)throw Error("Add XAI_API_KEY in Render.");
  const r=await fetch("https://api.x.ai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.XAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.XAI_MODEL||"grok-3-mini",messages:[{role:"user",content:prompt}],response_format:{type:"json_object"}})});
  const d=await r.json();if(!r.ok)throw Error(d.error?.message||"Grok request failed.");return d.choices?.[0]?.message?.content||"{}";
 }
 if(!process.env.GEMINI_API_KEY)throw Error("Add GEMINI_API_KEY in Render.");
 const model=process.env.GEMINI_MODEL||"gemini-2.5-flash";
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({generationConfig:{responseMimeType:"application/json"},contents:[{parts:[{text:prompt}]}]})});
 const d=await r.json();if(!r.ok)throw Error(d.error?.message||"Gemini request failed.");return d.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"{}";
}
app.post("/api/generate-metrics",async(req,res)=>{try{
 const {provider="gemini",description="",duration=52,viewsTarget="1.2M",engagement="High",audience="Global"}=req.body||{};
 const prompt=`Return ONLY valid JSON with numeric fields: views, reach, likes, comments, shares, saves, averageWatchTime, follows, skipRate, followerPct, nonFollowerPct, topLocations (array of {name,pct}), retention (array of 8 numbers). Create a plausible internally consistent SIMULATED analytics set for a ${duration}-second social video. User direction: ${description}. Views target: ${viewsTarget}. Engagement: ${engagement}. Audience: ${audience}. averageWatchTime must be seconds, views/reach and interactions integers, percentages 0-100. Mark this as fictional demo data in a separate note field. Do not claim real platform data.`;
 const raw=await ai(provider,prompt);let parsed;try{parsed=JSON.parse(raw.replace(/^```json|```$/g,"").trim())}catch{throw Error("AI returned invalid JSON. Try again with a shorter description.")};
 res.json({metrics:parsed,simulated:true,provider});
}catch(e){res.status(400).json({error:e.message})}});
app.get("*",(_,res)=>res.sendFile(path.join(__dirname,"index.html")));
app.listen(PORT,()=>console.log(`Orbit Social v4 on ${PORT}`));
