# Bhoomi Desk

A CRM for real-estate brokers in India who deal in plots, ventures, land and commercial property.

It runs as a single HTML page (`index.html`) published as a claude.ai Artifact. Records (leads, sellers, inventory, documents, market listings, area news) are stored in the artifact's own database on claude.ai, not in this repository.

## Features

- **Leads:** pipeline board (New → Contacted → Site Visit → Negotiation → Token Paid → Registered / Lost), follow-ups, activity log, buying timeline, agent assignment.
- **Lead score:** Hot / Warm / Cold from timeline, stage, recent contact and budget fit, plus an optional AI score with a next step.
- **AI assistant:** WhatsApp message drafts in English, Telugu, Hindi, Tamil, Kannada or Marathi; call-note summaries; paste an enquiry to fill a new lead.
- **Inventory:** plots, ventures and commercial property with Google Maps pin, measurements (sq.yd, sq.ft, cents, acres, guntas, ankanam), side lengths, facing, approvals, photos and videos.
- **Sellers:** contact details, address, documents seen, and their properties.
- **Matching:** properties suggested for each buyer by budget, area, size and facing, with WhatsApp share.
- **Market listings:** land posts from Instagram, YouTube and WhatsApp groups, read from screenshots or pasted captions, matched to buyers and convertible into inventory.
- **Area news:** daily briefing of government infrastructure announcements (roads, airports, rail, ports, industrial parks) for the chosen region, filled by a scheduled task.
- **Deals & commission:** deal value, commission, payment status and an 8-step deal checklist.
- **Team:** agents, lead assignment and a leaderboard.
- **Documents & compliance:** sale deeds, EC, agreements and receipts linked to records; broker RERA registration reminders.
- **WhatsApp templates**, **Google Sheet / Excel / CSV import**, and **Excel download** of all data.

## Runtime

The page uses the claude.ai Artifact runtime (`window.claude.use(...)`) for storage (`db`), file uploads (`assets`), downloads, AI (`sample`) and the Google Sheets connector (`mcp`). Opened outside claude.ai, it shows the interface but cannot save data.

Live app: https://claude.ai/artifact/1JHMbY1krmR5u56QbuFZm6 (private to its owner).

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | The whole app: HTML, CSS and JavaScript in one file. This is the file published to claude.ai. |
| `tasks/daily-area-news.md` | The scheduled task that fills the Area news tab every morning, with its full prompt and data format. |
| `tests/` | Headless browser smoke tests with stand-in runtime; see `tests/README.md`. |

## Data collections

`leads`, `properties`, `ventures`, `sellers`, `agents`, `templates`, `documents`, `settings` (doc `main`), `news` (one doc per day), `market`. Access rules allow only the owner and editors to read or write.

## Development

Edit `index.html`, run `npm test`, then republish the file to the same artifact URL.
