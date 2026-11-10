const $ = s => document.querySelector(s);
const page = $("#page");
let current = "home", profile = {username:"your_username",fullName:"Your Name",bio:"",followers:"—",following:"—",postsCount:"—",profilePicUrl:""};
let importedPosts = [], insightsTab = "overview", dashboardTab = "overview", profileTab = "posts";
const demoPosts = [
  {caption:"A moment worth remembering.",displayUrl:"",likes:1280,comments:42},
  {caption:"New post ✨",displayUrl:"",likes:940,comments:18},
  {caption:"",displayUrl:"",likes:2100,comments:67}
];
function toast(s){const t=$("#toast");t.textContent=s;t.style.display="block";clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display="none",2600)}
function fmt(n){if(n===null||n===undefined||n==="—")return "—";return Number(n).toLocaleString("en-IN")}
function nav(p){current=p;document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===p));render()}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.page)));
$("#openApp").addEventListener("click",()=>{$("#store").classList.add("hidden");$("#app").classList.remove("hidden");nav("home")});
function header(title,action=""){return `<div class="section-head"><h2>${title}</h2>${action}</div>`}
function avatar(name="u"){return `<div class="post-avatar">${name.slice(0,1).toUpperCase()}</div>`}
function render(){
  if(current==="home") page.innerHTML=home();
  if(current==="reels") page.innerHTML=reels();
  if(current==="explore") page.innerHTML=explore();
  if(current==="activity") page.innerHTML=activity();
  if(current==="profile") page.innerHTML=profilePage();
  if(current==="dashboard") page.innerHTML=dashboard();
  if(current==="insights") page.innerHTML=insights();
  if(current==="settings") page.innerHTML=settings();
  bindPage();
}
function home(){return `<div class="stories">${["Your story","maria","alex","jordan","sam","riley"].map((n,i)=>`<div class="story"><div class="story-ring"><div class="placeholder">${i?"◉":"＋"}</div></div>${n}</div>`).join("")}</div>${(importedPosts.length?importedPosts:demoPosts).map((p,i)=>`<article class="post"><div class="post-head">${avatar(profile.username)}<div><div class="post-user">${profile.username}</div><small class="muted">Suggested post</small></div><span style="margin-left:auto">•••</span></div><div class="post-media">${p.displayUrl?`<img src="${p.displayUrl}" alt="Post">`:"◎"}</div><div class="post-actions"><span>♡</span><span>◯</span><span>➤</span><span style="margin-left:auto">▱</span></div><div class="post-caption"><b>${fmt(p.likes)||"—"} likes</b><br>${p.caption||" "}<br><small class="muted">View all ${fmt(p.comments)} comments</small></div></article>`).join("")}`}
function reels(){return `<div class="reel-screen"><div class="reel-placeholder"><div style="font-size:56px">▣</div><p>Reels</p><small>Import a public profile to load available public posts.</small></div><div class="reel-side"><div>♡<small>Like</small></div><div>◯<small>Comment</small></div><div>➤<small>Share</small></div></div><div class="reel-caption"><b>${profile.username}</b><br>Public content preview</div></div>`}
function explore(){return `${header("Explore")}<label class="search-box">⌕ <input id="usernameSearch" placeholder="Search public username"></label><button class="action-button" id="searchProfile">Search profile</button><p class="notice">Search uses your configured Apify actor to retrieve publicly available profile information and posts. Private content is not accessed.</p><div id="searchOutput" class="search-results"></div>`}
function activity(){return `${header("Activity")}<div class="activity-row">${avatar("O")}<div><b>Welcome to Orbit Social</b><br><span class="muted">Your activity will appear here.</span></div></div><div class="empty">No new activity</div>`}
function profilePage(){return `<div class="profile-top"><div class="profile-main"><div class="profile-avatar">${profile.profilePicUrl?`<img src="${profile.profilePicUrl}">`:"◉"}</div><div class="profile-stats"><div><strong>${fmt(profile.postsCount)}</strong><span>posts</span></div><div><strong>${fmt(profile.followers)}</strong><span>followers</span></div><div><strong>${fmt(profile.following)}</strong><span>following</span></div></div></div><div class="profile-name">${profile.fullName}</div><div class="profile-bio">@${profile.username}${profile.bio?"\\n"+profile.bio:""}</div><div class="profile-buttons"><button class="soft-button" id="editProfile">Edit profile</button><button class="soft-button" data-page="settings">API settings</button><button class="soft-button" data-page="dashboard">Insights</button></div></div><div class="profile-tabs"><button class="${profileTab==="posts"?"selected":""}" data-profile-tab="posts">▦</button><button class="${profileTab==="reels"?"selected":""}" data-profile-tab="reels">▣</button><button class="${profileTab==="tagged"?"selected":""}" data-profile-tab="tagged">♙</button></div><div class="post-grid">${(importedPosts.length?importedPosts:demoPosts).map(p=>`<div class="grid-tile ${p.videoUrl?"video-tile":""}">${p.displayUrl?`<img src="${p.displayUrl}">`:"◎"}</div>`).join("")}</div>`}
function dashboard(){return `${header("Professional dashboard")}<div class="metric-grid"><div class="metric"><small>Views</small><strong>—</strong><em>Connect real data source</em></div><div class="metric"><small>Interactions</small><strong>—</strong><em>Connect real data source</em></div><div class="metric"><small>New followers</small><strong>${fmt(profile.followers)}</strong><em>Public profile snapshot</em></div><div class="metric"><small>Content shared</small><strong>${fmt(profile.postsCount)}</strong><em>Public profile snapshot</em></div></div><div class="tabs"><button class="${dashboardTab==="overview"?"selected":""}" data-dashboard="overview">Overview</button><button class="${dashboardTab==="content"?"selected":""}" data-dashboard="content">Content</button><button class="${dashboardTab==="audience"?"selected":""}" data-dashboard="audience">Audience</button></div>${dashboardTab==="overview"?`<div class="chart-card"><div class="chart-title">Views</div><div class="empty">Connect an authorized analytics data source to display real trends.</div></div><div class="settings-row" data-page="insights">AI insights <span>›</span></div>`:dashboardTab==="content"?`<div class="insight-row">Posts <b>${fmt(profile.postsCount)}</b></div><div class="empty">Content performance requires actual analytics data.</div>`:`<div class="insight-row">Followers <b>${fmt(profile.followers)}</b></div><div class="empty">Audience demographics are not provided by public profile scraping.</div>`}`}
function insights(){return `${header("Reel insights",`<select id="period" class="date-select"><option>Last 7 days</option><option>Last 14 days</option><option>Last 30 days</option><option>Last 60 days</option><option>Last 90 days</option><option>Custom</option></select>`)}<div class="tabs"><button class="${insightsTab==="overview"?"selected":""}" data-insight="overview">Overview</button><button class="${insightsTab==="engagement"?"selected":""}" data-insight="engagement">Engagement</button><button class="${insightsTab==="audience"?"selected":""}" data-insight="audience">Audience</button></div>${insightsTab==="overview"?`<div class="metric-grid">${metric("Views","—")}${metric("Accounts reached","—")}${metric("Average watch time","—")}${metric("Follows","—")}</div><div class="chart-card"><div class="chart-title">Views over time</div>${bars()}<div class="legend"><span><i></i>This Reel</span><span>Typical performance</span></div></div><div class="chart-card"><div class="chart-title">View rate past first 3 seconds</div><div class="insight-row">Skip rate <b>—</b></div><div class="insight-row">Average watch time <b>—</b></div><div class="insight-row">Top sources of views <b>—</b></div></div>`:insightsTab==="engagement"?`<div class="metric-grid">${metric("Likes","—")}${metric("Comments","—")}${metric("Shares","—")}${metric("Saves","—")}</div><div class="chart-card"><div class="chart-title">Interactions</div><div class="insight-row">Profile activity <b>—</b></div><div class="insight-row">Follows <b>—</b></div></div>`:`<div class="metric-grid">${metric("Followers","—")}${metric("Non-followers","—")}</div><div class="chart-card"><div class="chart-title">Top locations</div><div class="empty">Audience demographics require authorized first-party analytics.</div></div>`}<p class="notice">Blank metrics are intentional until real analytics are connected. AI-generated values are estimates and are never labelled as verified Instagram data.</p><button class="action-button" data-page="settings">Configure AI provider</button>`}
function metric(name,value){return `<div class="metric"><small>${name}</small><strong>${value}</strong><em>Not connected</em></div>`}
function bars(){return `<div class="bars">${[22,38,30,56,43,74,62,48,82,66,90,72].map(h=>`<div class="bar" style="height:${h}%"></div>`).join("")}</div>`}
function settings(){return `${header("Settings")}<div class="settings-row"><b>API configuration</b><span class="muted">Server-side</span></div><p class="notice">Keep API keys in Render → Environment. Never paste secrets into this page or commit them to GitHub.</p><div class="settings-row">Apify <span id="apifyState">Checking…</span></div><div class="settings-row">Gemini <span id="geminiState">Checking…</span></div><div class="settings-row">Grok <span id="grokState">Checking…</span></div><button class="action-button" id="checkStatus">Check connection</button><div class="settings-row" data-page="dashboard">Professional dashboard <span>›</span></div><div class="settings-row" data-page="insights">Insights studio <span>›</span></div><p class="notice">Orbit Social is an independent prototype. It does not log into Instagram, access private accounts, DMs or private analytics.</p>`}
function bindPage(){
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.page)));
  document.querySelectorAll("[data-profile-tab]").forEach(b=>b.addEventListener("click",()=>{profileTab=b.dataset.profileTab;render()}));
  document.querySelectorAll("[data-dashboard]").forEach(b=>b.addEventListener("click",()=>{dashboardTab=b.dataset.dashboard;render()}));
  document.querySelectorAll("[data-insight]").forEach(b=>b.addEventListener("click",()=>{insightsTab=b.dataset.insight;render()}));
  $("#searchProfile")?.addEventListener("click",searchProfile);
  $("#checkStatus")?.addEventListener("click",checkStatus);
  $("#editProfile")?.addEventListener("click",()=>toast("Profile editing is not connected in this prototype."));
}
async function searchProfile(){
  const u=$("#usernameSearch").value.trim().replace(/^@/,"");if(!u)return toast("Enter a public username.");
  $("#searchOutput").innerHTML="<p class='muted'>Searching public profile…</p>";
  try{
    const [pr,po]=await Promise.all([fetch(`/api/profile/${encodeURIComponent(u)}`),fetch(`/api/posts/${encodeURIComponent(u)}?limit=18`)]);
    const p=await pr.json(),posts=await po.json();if(!pr.ok)throw new Error(p.error||"Profile lookup failed.");if(!po.ok)throw new Error(posts.error||"Post lookup failed.");
    profile={username:p.username,fullName:p.fullName,bio:p.biography,followers:p.followers,following:p.following,postsCount:p.postsCount,profilePicUrl:p.profilePicUrl};
    importedPosts=posts;$("#searchOutput").innerHTML=`<div class="result-row">${avatar(p.username)}<div><b>${p.fullName}</b><br><small class="muted">@${p.username} · ${fmt(p.followers)} followers</small></div><button class="soft-button" id="viewProfile">View</button></div>`;
    $("#viewProfile").addEventListener("click",()=>nav("profile"));toast("Public profile loaded.");
  }catch(e){$("#searchOutput").innerHTML=`<p class="muted">${e.message}</p>`}
}
async function checkStatus(){
  try{const r=await fetch("/api/status");const d=await r.json();$("#apifyState").textContent=d.apify?"Connected":"Not configured";$("#geminiState").textContent=d.gemini?"Connected":"Not configured";$("#grokState").textContent=d.grok?"Connected":"Not configured";toast("Connection status updated.");}
  catch(e){toast("Could not check server status.")}
}
checkStatus();
if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
