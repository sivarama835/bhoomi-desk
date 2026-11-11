# Daily area news task

A scheduled task fills the **Area news** tab every morning.

- **Name:** Bhoomi Desk daily area news
- **Schedule:** every day at 8:06 AM IST (`CRON_TZ=Asia/Kolkata 6 8 * * *`), so the briefing is ready by 8:30
- **Runs as:** a fresh Claude Code cloud session each time, with phone notification on finish
- **Reads:** `settings/main` (`newsRegion`, `newsFocus`) and the last 10 `news` documents
- **Writes:** one document per day, `news/<YYYY-MM-DD>`, shaped as below

```json
{
  "date": "YYYY-MM-DD",
  "region": "Andhra Pradesh",
  "generatedAt": "ISO time with +05:30",
  "headline": "one sentence",
  "highlights": ["3–6 short points"],
  "items": [{
    "title": "", "summary": "", "category": "", "status": "", "impact": "High|Medium|Low",
    "impactNote": "", "location": "", "district": "", "source": "", "url": "", "published": "YYYY-MM-DD"
  }]
}
```

Categories: Roads & highways, Airports, Rail & metro, Ports & logistics, Industrial & IT parks, Capital & urban development, Water & irrigation, Power & energy, Housing & layouts, Land & policy, PPP & investments, Other.

## Prompt

The task sends this prompt each morning:

```text
You prepare the daily infrastructure news briefing for "Bhoomi Desk", a private real-estate CRM used by a land/plot broker. Save it into the CRM's database. Do not change anything else in the CRM, and do not publish or edit the page itself.

CRM artifact URL: https://claude.ai/artifact/1JHMbY1krmR5u56QbuFZm6
Tools: load the `ArtifactData` and `WebSearch` tools with ToolSearch (query "select:ArtifactData,WebSearch") before using them.

Steps
1. Work out today's date in India (Asia/Kolkata, YYYY-MM-DD). Call it TODAY.
2. Read settings: ArtifactData action "get", collection "settings", doc_id "main". Use its `newsRegion` (default "Andhra Pradesh") and `newsFocus` (comma-separated towns/mandals/corridors the broker cares most about; may be empty).
3. Read recent briefings to avoid repeats: ArtifactData action "list", collection "news", query {"limit": 10}. Note the titles and URLs already covered in the last 7 days.
4. Search for news from the last 48 hours (if TODAY is a Monday, the last 72 hours) about government announcements and projects in the region that can affect land and plot prices. Run these WebSearch queries in parallel (mode "standard"; switch to "extended" only if results are thin), replacing REGION with the region and adding the month and year:
   - REGION new road highway ring road expressway sanctioned announced
   - REGION airport news
   - REGION railway line metro station announced approved
   - REGION port fishing harbour logistics park
   - REGION cabinet decisions land allotment industrial park SIPB approval
   - REGION capital Amaravati CRDA works news (only if the region is Andhra Pradesh)
   - REGION PPP MoU investment infrastructure project
   - REGION layout approval land pooling land acquisition policy
   - one query per focus town (up to 6): "<town> development project news"
   Prefer official sources (state government press releases, PIB, CRDA/APIIC/NHAI/Railways) and established newspapers (The Hindu, Deccan Chronicle, The Hans India, Times of India, Eenadu, Sakshi, Andhra Jyothy, Deccan Herald, ETV Bharat). Ignore property-ad sites, YouTube and pure opinion.
5. Build 5–15 items. Every item must come from a real search result with its URL; never invent projects, figures, dates or sources. Skip anything already covered in step 3 unless there is a genuinely new development (then say what changed). If a claim has only one weak source, set status "Reported" and say it needs confirmation. Write everything in plain, simple English for a broker.
   Each item: {"title","summary" (2–3 sentences with key numbers),"category" (exactly one of: "Roads & highways","Airports","Rail & metro","Ports & logistics","Industrial & IT parks","Capital & urban development","Water & irrigation","Power & energy","Housing & layouts","Land & policy","PPP & investments","Other"),"status" (e.g. "Proposed","Announced","Approved","MoU signed","Tender","Land acquisition","Under construction","Completed","Reported"),"impact" ("High","Medium" or "Low": how much it can move land or plot prices nearby),"impactNote" (one sentence: what it means for land/plot buyers and where; be careful, say "could" or "likely", and note early-stage risk),"location" (towns/villages/corridors named),"district","source" (publication name),"url","published" (YYYY-MM-DD)}.
6. Write 3–6 "highlights": one-line, plain-English points with the most important news first (numbers and places included). Write one "headline" sentence summarising the day. If nothing relevant was found, write an honest headline saying so and an empty items list.
7. Save with ArtifactData action "set", collection "news", doc_id TODAY, data:
   {"date": TODAY, "region": <region>, "generatedAt": <current time ISO with +05:30>, "headline": ..., "highlights": [...], "items": [...]}
   Keep the document under 200 KB. If a document for TODAY already exists, read it first and write with its version as if_version, merging in new items instead of losing old ones.
8. Finish with a short plain-text summary: the headline and the number of items saved.
```
