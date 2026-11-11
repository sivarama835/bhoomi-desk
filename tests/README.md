# Browser tests

Smoke tests that load `index.html` in headless Chromium with the claude.ai runtime replaced by in-memory stand-ins (storage, file uploads, AI answers, Google Sheets, downloads). They click through the main flows and fail if the page throws an error.

| Test | Covers |
|---|---|
| `inventory-sellers.test.js` | Sellers tab, property details, map pin, measurements, edit form |
| `seller-form-location.test.js` | Add seller and property form, photo location (EXIF GPS), area calculation |
| `ai-team-docs-import.test.js` | Lead score, AI score/draft/summary, templates, paste enquiry, team leaderboard, documents, Google Sheet import, Excel export |
| `market-listings.test.js` | Market listings: paste posts, screenshots, buyer matching, convert to seller and property |

Run all of them:

```bash
npm test
```

Screenshots go to the system temp folder, or to `OUT_DIR` if set. `fixtures/xlsx-stub.js` stands in for the SheetJS library so the tests run offline; `fixtures/gps.jpg` is a tiny photo with GPS data.

These tests use stand-in answers, so they check the page's own logic, not real Claude, Google Sheets or claude.ai storage responses.
