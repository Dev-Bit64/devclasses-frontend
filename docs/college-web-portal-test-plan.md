# Web Portal — College Modules Test Plan

Manual test script for every admin screen added for the college / mobile product, written against
the current state of the portal (tabbed **Chapter Content** screen, nine-item sidebar).

Everything below is tested in a browser as a signed-in **ADMIN**. A STUDENT is redirected to
`/dashboard` by the route guard on every college route — that guard is navigation UX only, and the
API authorises each call independently.

---

## 1. Module inventory

| # | Module | Route | What it is |
|---|---|---|---|
| A | Navigation & shell | — | Sidebar grouped by product, collapse, drawer, scrollbars |
| B | Dashboard product switcher | `/dashboard` | School / College toggle and the college analytics view |
| C | College Curriculum | `/college-curriculum` | Course → Semester → Subject → Chapter authoring |
| D | Chapter Content | `/college-content` | One screen, three tabs: Videos, Notes, Practice |
| E | College Orders | `/college-orders` | Read-only purchase ledger |
| F | Mobile Users | `/college-students` | Read-only student list + detail drawer |
| G | Device Transfer Requests | `/college-device-requests` | Approve/reject the one-device-per-student queue |
| H | Responsive & accessibility sweep | all | Phone layout and keyboard/screen-reader pass |
| I | School regression | school routes | Nothing here was meant to change |
| J | End-to-end with the mobile app | — | Buy → unlock → watch → transfer device |

Videos, Notes and Practice used to be three separate screens at `/college-videos`,
`/college-notes` and `/college-practice`. Those URLs still work — they redirect to
`/college-content` with the matching `?tab=` and carry their query string across.

---

## 2. Before you start

### 2.1 Bring the stack up

```bash
docker start devclasses-mariadb                       # or confirm it is already up on 3307
cd "d:/Dev Classes (new website)/devclasses-backend"  && npm run dev
cd "d:/Dev Classes (new website)/devclasses-frontend" && npm run dev
```

> If the backend has had an `npm install` since it last ran, run `npm run prisma:generate:college`
> first — `npm install` silently prunes `node_modules/@prisma/college-client` and `tsc` will fail.

### 2.2 Environment keys

Most of the plan runs against an unconfigured environment. Steps that cannot are tagged:

| Tag | Needs | Symptom if missing |
|---|---|---|
| **[STG]** | Storage (`STORAGE_DRIVER=local`, `STORAGE_ROOT`, `STORAGE_URL_SECRET`, `STORAGE_MAX_UPLOAD_MB`) and a writable `STORAGE_ROOT` | 500 "Video storage is not configured…", a 403 on every upload/playback link, or `EACCES` in the backend log |
| **[RZP]** | Razorpay (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) + a registered webhook | Checkout cannot open; entitlements are never granted |

Files now live on the API host's own disk rather than in an object store. `STORAGE_ROOT` must be a
**persisted volume** (`/data/college`, mapped from `/var/lib/devclasses/college` in
`docker-compose.yaml`) — a plain container path is wiped on every redeploy. `STORAGE_URL_SECRET`
is the *whole* of the authorisation on the upload and playback routes: it must be a fresh
`openssl rand -hex 32`, must differ from `ENCRYPTION_KEY`, and must never be committed.

`API_URL` must be the address the browser actually reaches the API on — every signed URL is built
from it, so a wrong value breaks uploads **and** playback with no other symptom.

> **Before testing a real upload on a deployed host**, check what sits in front of the API. nginx
> defaults `client_max_body_size` to **1 MB** and will reject a video long before Express sees it
> (needs `client_max_body_size 512m;` plus `proxy_request_buffering off;` on the storage location).
> Cloudflare's free plan caps request bodies at **100 MB and it cannot be raised** — if the API is
> proxied through Cloudflare, videos above 100 MB need an un-proxied hostname for these routes.
> A failure here looks like a broken app, not a misconfigured proxy.

The portal itself also needs `VITE_REACT_APP_API_ENDPOINT` and `VITE_ENCRYPTION_KEY`, and the
latter **must match the backend `ENCRYPTION_KEY`** or every non-GET request fails to decrypt.

Never paste real key values into a commit, a chat, or this file.

### 2.3 Seed data

Create this from `/college-curriculum` before testing content (the page can create the course and
semester itself):

- One **course** and at least one **semester**.
- One **subject**.
- **Two chapters** — one marked **Free**, one **Paid** with a price. Having both is what makes the
  gating differences visible later, in module J.

### 2.4 How to record results

Each table has a **Result** column. Use `PASS` / `FAIL` / `N/A (no keys)`, and put the browser
console output next to anything that fails.

---

## Module A — Navigation & shell

| # | Step | Expected | Result |
|---|---|---|---|
| A1 | Look at the sidebar as an ADMIN | Three groups: **Dashboard** ungrouped at the top, then **WEBSITE (TUITION)** with Questions / Subjects / Users, then **MOBILE (COLLEGE)** with College / Content / Orders / App Users / Devices — **nine items total** | |
| A2 | Click each of the nine items | Each navigates, and **exactly one** shows the active state (blue fill + white left rail) | |
| A3 | Open `/college-content`, then `/college-curriculum` | Only one of them is ever highlighted — the two paths share a prefix and must not both match | |
| A4 | Shrink the window until the nav scrolls | Scrollbar is a **slim rounded pill** — no arrow buttons, no white track; it brightens on hover | |
| A5 | Collapse the rail (chevron, top right of the sidebar) | Headings disappear, replaced by a **divider rule** between groups; icons remain; hovering any icon shows its tooltip | |
| A6 | While collapsed, hover the log-out icon, then click it | Tooltip appears **and** the confirm dialog opens. **Check the console: no "Function components cannot be given refs" warning.** This is the regression test for the collapsed-log-out fix | |
| A7 | Below 1024px, open the drawer (hamburger) | Same three groups; picking an item navigates and closes the drawer | |
| A8 | Check the browser tab title on each college route | Curriculum → "College Curriculum", Content → "Chapter Content", Orders → "College Orders", App Users → "Mobile Users", Devices → "Device Requests" | |
| A9 | Sign in as a STUDENT | One ungrouped list: Dashboard / Test / Your Results. No section headings, no college items | |
| A10 | As a STUDENT, type `/college-content` into the address bar | Redirected to `/dashboard` | |

---

## Module B — Dashboard product switcher

| # | Step | Expected | Result |
|---|---|---|---|
| B1 | Open `/dashboard` as an ADMIN | A **School / College** toggle sits at the top. School is selected the first time | |
| B2 | Switch to **College** | The college analytics view replaces the school one: four stat tiles — Earned this month, Students signed up, Chapters being studied, Phone changes waiting | |
| B3 | Reload the page | The toggle is **still on College** — the choice is stored per browser | |
| B4 | Read the four charts | Money earned each month, Students in each semester, What happened to each payment, Best-selling chapters. Each has a heading, and an empty dataset shows an empty state rather than a blank box | |
| B5 | Check the money figures | Rupees with two decimals and Indian digit grouping (e.g. `₹1,20,450.00`). Never a bare paise integer, never a floating-point tail like `1204.5000000001` | |
| B6 | Read the "What these numbers cover" note at the bottom | Present, and explains the period each figure covers | |
| B7 | Switch back to **School** | The original school dashboard returns unchanged | |
| B8 | Narrow to phone width | The toggle goes full width, tiles stack, charts stay readable and do not overflow the page horizontally | |

---

## Module C — College Curriculum (`/college-curriculum`)

| # | Step | Expected | Result |
|---|---|---|---|
| C1 | Open the page cold | Course and Semester dropdowns; Semester is disabled until a course is chosen. Empty state reads "Select a course and semester" | |
| C2 | Click **+ Course**, save a course | Toast; it appears in the Course dropdown | |
| C3 | Click **+ Semester**, try semester number `7` | Inline error — the number must be between 1 and 6 | |
| C4 | Save semester `1` | Toast; it appears in the Semester dropdown | |
| C5 | Click **Add Subject**, submit empty | Inline error on Name; nothing is sent | |
| C6 | Save a subject | Toast; the row appears with its chapter count, order and Published/Draft status | |
| C7 | Expand the subject row | Chapters load **on first expand only**, then stay cached | |
| C8 | **Add Chapter** → tick Free **and** enter a price | Refused: "A free chapter cannot have a price" | |
| C9 | **Add Chapter** → leave Free unticked with price `0` | Refused: "A paid chapter needs a price greater than 0" | |
| C10 | Save a paid chapter at `₹199` | Toast; the chapter subtitle reads `₹199.00`, the access window, the view cap, and `0 videos, 0 notes, 0 MCQs` | |
| C11 | Look at a chapter row's buttons | **Five**: Videos (film), Notes (notebook), Practice (checklist), Edit, Delete | |
| C12 | Click the **film** icon | Lands on `/college-content` with **course, semester, subject and chapter already selected**, on the **Videos** tab. No re-picking | |
| C13 | Same for the notebook and checklist icons | Same, on the **Notes** and **Practice** tabs respectively | |
| C14 | Reload one of those deep-linked URLs | The selection **and** the tab are restored from the query string | |
| C15 | After arriving, change a dropdown by hand | The deep-link ids do **not** re-apply — they are consumed once | |
| C16 | Try to delete a subject that has a purchased chapter | Refused by the API with a clear message | |
| C17 | Come back after modules D | The chapter subtitle counts (`N videos, N notes, N MCQs`) reflect what you created | |
| C18 | Phone width → "Manage chapters" on a subject card | The chapter list opens inside the card, and the three content buttons are present there too | |

---

## Module D — Chapter Content (`/college-content`)

### D.1 — The shared shell

| # | Step | Expected | Result |
|---|---|---|---|
| D1.1 | Open the page cold from the sidebar | Page header "Chapter Content", the four-level picker, and a **"Select a chapter"** card. **No tabs are rendered yet** | |
| D1.2 | Pick course → semester → subject → chapter | Each dropdown enables only after its parent is chosen. If exactly one course exists it is auto-selected. Draft chapters read "(draft)" in the chapter list | |
| D1.3 | With a chapter selected | A summary card shows the chapter name, a Published/Draft badge and Free/Paid. Below it, three tabs appear | |
| D1.4 | Read the tab labels | **Videos**, **Notes**, **Practice**, each with an icon and a **count** beside it once loaded. All three counts appear together, without visiting each tab | |
| D1.5 | Switch between tabs | Content swaps instantly. **No loading spinner and no refetch** — all three load once when the chapter is picked | |
| D1.6 | Check the URL after switching tabs | `?tab=` updates to `videos` / `notes` / `practice`, and the chapter ids stay in the query string | |
| D1.7 | Reload on a non-default tab | It comes back on the same tab | |
| D1.8 | Press the browser **Back** button after switching tabs | The tab follows the URL back | |
| D1.9 | Change the chapter while on, say, the Practice tab | The tab stays on Practice, the counts blank and then reload for the new chapter, and any row selection is cleared | |
| D1.10 | Visit the old URL `/college-videos?chapterId=…` directly | Redirected to `/college-content?chapterId=…&tab=videos`, with the chapter still selected | |
| D1.11 | Same for `/college-notes` and `/college-practice` | Redirected to the matching tab | |
| D1.12 | Tab through the tab strip with the keyboard | Arrow keys move between tabs; only the **active** panel's controls are reachable by Tab — the hidden panels must be out of the tab order | |

### D.2 — Videos tab **[STG for uploads and previews]**

| # | Step | Expected | Result |
|---|---|---|---|
| D2.1 | Look at the tab before choosing anything | A one-line description on the left, **Add Video** on the right | |
| D2.2 | Click Add Video, submit empty | Inline error on Title; nothing is sent | |
| D2.3 | Choose a `.txt` or `.png` in the video dropzone | Rejected: "Only MP4, WebM or MOV video files can be uploaded." The file is not accepted into the field | |
| D2.4 | Choose a valid MP4 | The file chip appears **and the Length (seconds) field fills itself in** from the file's metadata | |
| D2.5 | **[STG]** Submit with a title | Progress bar reads "Uploading video" with a live percentage, then "Saving"; toast "Video added successfully"; the row appears; the **tab count increments** | |
| D2.5a | **[STG]** Upload a video larger than `STORAGE_MAX_UPLOAD_MB` (default 500 MB) | A clean **size** message — "the file is larger than the 500 MB limit" or similar. **Not** a bare "network error", not a hung progress bar, and not `ECANCELED` in the console. The overflowing request is drained rather than the socket killed precisely so this message can arrive; a network-shaped failure here is a **regression**. Afterwards, nothing is left in `STORAGE_ROOT` — no stray `.part` file | |
| D2.6 | **[STG]** Add a second video with a thumbnail image | Two progress phases: "Uploading video", then "Uploading thumbnail". The table shows Thumbnail = Yes | |
| D2.7 | Choose a non-image in the thumbnail dropzone | Rejected: "Only JPG, PNG or WebP images can be uploaded as thumbnails." | |
| D2.8 | **[STG]** Click ▶ on a **draft** video | The dialog plays it, the poster shows the thumbnail if there is one, and an amber **"This video is still a draft"** alert is present | |
| D2.8a | **[STG]** While a video is playing, **drag the scrubber to the middle, then near the end** | Playback jumps to that point and continues from there, within a second or two. **This is the important new regression.** Serving is now Node with hand-rolled HTTP `Range` handling; object storage gave range requests for free and the API does not. If ranges were broken, straight playback would still look perfect and only **scrubbing would silently do nothing** — the player snaps back, or freezes, or restarts from zero. Test it on a video long enough to seek in (a few minutes), not a 10-second clip | |
| D2.8b | **[STG]** Reload the preview and, before playing, drag straight to the middle | Plays from there without downloading the whole file first. This is the open-ended `bytes=0-` request a `<video>` opens with, followed by a real ranged one | |
| D2.9 | **[STG]** Leave the preview open >5 minutes, then scrub | Playback fails — the signed link expired (the scrub issues a fresh ranged request, and it is that request the API refuses). The dialog shows the **expired** message, not a generic failure. Click **"Get a fresh link"** → playback and scrubbing work again. *This is the expiry design, not a bug* | |
| D2.9a | **[STG]** Take a playback URL from the network tab, wait past 5 minutes, and open it directly in a new tab. Then tamper with one character of the signature on a **fresh** link and open that | **403** both times — the first saying the link expired, the second that it is invalid. Both are 403 on purpose, so a probe learns nothing from the status code | |
| D2.10 | Edit a video, change only the title, save | Toast and updated row. **No progress bar** — the file is not re-uploaded, and playback still works because the stored key was left untouched | |
| D2.11 | **[STG]** Edit a video and upload a replacement file | The progress bar runs; the preview plays the new file | |
| D2.12 | Tick Published, save | The video becomes visible to entitled students (confirm in module J) | |
| D2.13 | Select 2+ rows with the checkboxes | An "N selected" bar appears with **Delete selected** | |
| D2.14 | Delete a video and confirm | Toast; the row goes; the tab count decrements. The stored file is removed too — best-effort, so a storage failure must not block the row delete | |
| D2.15 | Phone width (~390px) | The table becomes cards, and **every card carries Preview, Edit and Delete** | |

### D.3 — Notes tab **[STG for PDF upload and preview]**

| # | Step | Expected | Result |
|---|---|---|---|
| D3.1 | Click Add Note | The kind radio defaults to **Upload a PDF** | |
| D3.2 | Choose a `.docx` or anything non-PDF | Rejected: "Only PDF files can be uploaded as notes." | |
| D3.3 | Submit as **Upload a PDF** with no file | Toast "Please choose a PDF file to upload"; nothing is sent | |
| D3.4 | Switch to **Write it here** and submit empty | Inline error "Please write the note, or switch to uploading a PDF" | |
| D3.5 | Write some text and save | Toast; the row shows the kind badge **Written** | |
| D3.6 | **[STG]** Add a PDF note | Progress bar "Uploading PDF"; the row shows the kind badge **PDF** | |
| D3.7 | Click the eye on the **Written** note | A text dialog opens. If the text contains `<b>bold</b>`, it must render **as literal characters, not as bold** — note content is deliberately never injected as HTML | |
| D3.8 | **[STG]** Click the eye on the **PDF** note | The PDF renders in the iframe; a draft shows the amber draft alert; "Open in a new tab" works. On a **multi-page** PDF, jump to the last page — the viewer fetches by range too, so this exercises the same code path as D2.8a | |
| D3.9 | Edit the PDF note and switch its kind to **Write it here** | An amber warning appears **before** saving: "Saving replaces the uploaded PDF with the text you write here." | |
| D3.10 | Save that switch, then reopen the preview | It is now a Written note and the old PDF is no longer served. *(The stored file itself stays on disk — see §7)* | |
| D3.11 | Edit a PDF-only note and try to clear the file without adding text | **The API refuses with 400.** Update validates the merged result, so a note can never end up with nothing in it. This is the important negative test | |
| D3.12 | Bulk select + Delete selected | The rows and their stored PDFs go | |
| D3.13 | Phone width | Cards carry Open/Read, Edit and Delete, plus both the kind and status badges | |

### D.4 — Practice tab

| # | Step | Expected | Result |
|---|---|---|---|
| D4.1 | Read the line above the table | "Multiple-choice practice for the mobile app. **N of M published.**" and it tracks what you publish | |
| D4.2 | Add Question, submit empty | Inline errors on the question and on all four options | |
| D4.3 | Fill everything, choose correct answer **C**, save | Toast; the row shows answer badge **C** | |
| D4.4 | Click the eye | The preview shows the question exactly as a student sees it — **answer hidden**. Click "Show the answer" → the correct option is marked with a tint **and a tick** (never colour alone), and the explanation appears, or "No explanation was written for this question." | |
| D4.5 | Preview a **draft** question | Amber "This question is still a draft" alert | |
| D4.6 | Click **Import** | The dialog explains the column order: question, A, B, C, D, answer, optional explanation | |
| D4.7 | Paste 3 good rows **copied from a spreadsheet** (tab-separated) | "3 row(s) ready"; the Import button is enabled and reads "Import 3 question(s)" | |
| D4.8 | Paste a row with only 4 columns, and one with answer "E" | Each is listed by line number: `Line 2: needs 6 columns…`, `Line 3: answer "E" must be A, B, C or D`. **Import is disabled until they are fixed** | |
| D4.9 | Paste more than 8 bad rows | The list caps at 8 with "…and N more." | |
| D4.10 | Fix them and import with "Publish straight away" ticked | The toast reports the imported count; rows appear as Published, in the order pasted; the tab count jumps by the imported number | |
| D4.11 | Paste comma-separated rows instead | Also parsed — but note that commas inside question text split wrongly, which is why tabs are the documented path. Confirm the spreadsheet paste is what the help text describes | |
| D4.12 | Try importing more than 500 rows | The API rejects: "An import can hold at most 500 questions." | |
| D4.13 | Edit a question, change the correct answer, save | The badge updates and the preview reveals the new answer | |
| D4.14 | Bulk select + delete | The rows go | |
| D4.15 | Phone width | Cards show all four options with the correct one ticked, plus Preview / Edit / Delete | |

---

## Module E — College Orders (`/college-orders`)

| # | Step | Expected | Result |
|---|---|---|---|
| E1 | Open the page | Header says the ledger is **read-only**. No add/edit/delete controls exist anywhere on it | |
| E2 | Type 2 characters in the search box | The Search button is disabled and an inline "Please enter at least 3 characters to search" appears | |
| E3 | Search a student name of 3+ characters, press Enter | Results filter and the pager resets to page 1 | |
| E4 | Clear the search box | The full list returns without needing to press Search again | |
| E5 | Open the **Status** column filter | Four plain-word options: Awaiting payment / Paid / Failed / Refunded. **No raw enum names** (`CREATED`, `PAID`…) appear on screen | |
| E6 | Apply "Paid", then Reset | The list filters, then returns to everything; the pager resets each time | |
| E7 | Check the Amount column | Rupees with two decimals and Indian grouping, right-aligned, tabular figures. `₹1,999.00`, never `199900` and never `1999.0000000002` | |
| E8 | Check a status badge | The **word** carries the meaning; colour is a second cue only | |
| E9 | Page through the results | The footer reads "1-20 of N orders" and the counts are right at the last page | |
| E10 | Phone width | Each order becomes a card with student, email, status, chapter, amount and date. Nothing important is desktop-only | |

---

## Module F — Mobile Users (`/college-students`)

| # | Step | Expected | Result |
|---|---|---|---|
| F1 | Open the page | Header states it is **read-only** — accounts are managed from the app and phones move only through the transfer queue | |
| F2 | Search with fewer than 3 characters | Same guard as orders: button disabled, inline message | |
| F3 | Use the **Semester** column filter | Six options, Semester 1–6 | |
| F4 | Read a row | Student name + email, course and semester, chapters bought, whether a phone is registered, joined date | |
| F5 | Open a student (row action) | A right-hand drawer opens, titled "<name> — college profile" | |
| F6 | Read the drawer's stat tiles | Compact tiles, with money formatted the same way as everywhere else | |
| F7 | Work through the drawer's four tabs | **Chapters**, **Phones**, **Payments**, **Watching** | |
| F8 | Open each tab for a brand-new student | Each shows its own empty state: "No chapters bought yet", "No phone registered", "No payments yet", "Nothing watched yet" — never a blank panel | |
| F9 | Check the status words in the drawer | Plain words only: Open / Ended / Withdrawn for entitlements, Awaiting payment / Paid / Failed / Refunded for orders, Waiting for approval / Approved / Rejected for transfers | |
| F10 | Close the drawer and open a different student | The previous student's detail is cleared first — no stale data flashes | |
| F11 | Phone width | The drawer takes the full width and all four tabs remain reachable | |

---

## Module G — Device Transfer Requests (`/college-device-requests`)

| # | Step | Expected | Result |
|---|---|---|---|
| G1 | Open the page cold | The Status filter already reads **Waiting for approval** — the queue opens on what still needs a decision | |
| G2 | With nothing pending | Empty state: "Nothing waiting for approval" | |
| G3 | Read a pending row | Student + email, course and semester, the **new device label** (never the device key itself), the reason given, status, requested date, and Approve / Reject buttons | |
| G4 | Click **Approve** | The dialog explains that the student moves to the new device **immediately** and the old one loses paid chapters. The note field is **optional** here | |
| G5 | Approve with an empty note | Accepted; toast; the row leaves the pending queue | |
| G6 | Click **Reject** on another request, submit with an empty note | Refused with an inline error: "Please tell the student why the request was refused" | |
| G7 | Reject with a note | Accepted; toast; the row leaves the pending queue | |
| G8 | Switch the filter to Approved or Rejected | Reviewed rows show "Reviewed <date>" **instead of** Approve/Reject buttons — history is not re-decidable | |
| G9 | Try a >1000-character note | Refused: "Note must be 1000 characters or fewer" | |
| G10 | Close the dialog mid-submit | Blocked while the request is in flight | |
| G11 | Phone width | Each request becomes a card carrying the student, new device, reason, date **and the Approve/Reject buttons** | |

---

## Module H — Responsive & accessibility sweep

Run this across **every** college route: `/college-curriculum`, `/college-content` (all three tabs),
`/college-orders`, `/college-students`, `/college-device-requests`.

| # | Step | Expected | Result |
|---|---|---|---|
| H1 | DevTools at 390px wide, scroll each page top to bottom | **The page body never scrolls horizontally.** Wide content scrolls inside its own container | |
| H2 | At 390px, compare each card against its desktop row | Every action available on the desktop row is on the card. `DataTable` does **not** render `expandedRowRender` below `md`, so anything using row expansion must repeat it in the card | |
| H3 | At 768px and 1024px | Layouts reflow without clipping; column `hideBelow` rules drop the least important columns first | |
| H4 | Keyboard only: Tab through each page | Every control is reachable in a sensible order, and the focus ring is always visible | |
| H5 | Keyboard only: open each dialog | Focus moves into the dialog, is trapped there, Escape closes it, and focus returns to the trigger | |
| H6 | Keyboard only: the custom dropdowns | Arrow keys, Enter, Escape and type-ahead all work | |
| H7 | Submit each form with errors, using a screen reader | Errors are announced and tied to their field | |
| H8 | Look at every place colour signals meaning | There is always a second cue — a word, a tick, or an icon. The practice-answer tick and the status badge wording are the two to check first | |
| H9 | Open a tall dialog (Add Video, Import Questions) and scroll it | The body scrolls with the slim `.dc-scroll` scrollbar, not the platform default | |

---

## Module I — School regression

Nothing in the college work was meant to touch the school product. This module proves it.

| # | Step | Expected | Result |
|---|---|---|---|
| I1 | School admin: Dashboard, Questions, Subjects, Users | Load and behave exactly as before | |
| I2 | School student: run one full exam end to end | Unaffected | |
| I3 | School student: view results | Unaffected | |
| I4 | Re-run the row counts in §6 | **Byte-identical.** Any drift means something wrote to the school database and must be investigated before going any further | |

---

## Module J — End-to-end with the mobile app **[STG] [RZP]**

The highest-value test in this document, and the one that has **never been run**. It needs both
key sets configured, and Razorpay cannot reach `localhost` — run a tunnel
(`cloudflared tunnel --url http://localhost:PORT` or ngrok) and register the tunnel URL as the
webhook endpoint, `https://<tunnel>/api/v2/college/payment/webhook`, subscribed to
`payment.captured`, `order.paid` and `payment.failed`.

| # | Step | Expected | Result |
|---|---|---|---|
| J1 | Register a student in the mobile app | They land on the **free** chapter and can open it | |
| J2 | Open a **paid** chapter | The paywall appears | |
| J3 | Pay with a Razorpay **test** card | Checkout completes. The app needs no Razorpay key of its own — `createOrder` returns `keyId` | |
| J4 | Check `/college-orders` | The order flips to **Paid**, and the chapter unlocks in the app. Confirm the **webhook** granted it, not the app's success callback — that is the whole point of the webhook | |
| J5 | Play a video to the end | Progress is recorded and the view counter behaves | |
| J6 | Check `/college-students` → that student → Watching | The video appears with its progress | |
| J7 | Sign in on a **second device** | Paid content is blocked; **free content still works** | |
| J8 | Request a transfer from the second device | The request appears in `/college-device-requests` as Waiting for approval | |
| J9 | Approve it in the portal | Toast; the row leaves the pending queue | |
| J10 | Go back to the **first** device | It immediately loses paid access — the device lock is re-read from the `x-device-key` header on every gated request | |
| J11 | Check the second device | Still signed in and now holding paid access. `tokenVersion` is deliberately **not** bumped, so the student is not signed out of the handset they just waited for | |

---

## 6. Verification block

Run this after any code change made while working through the plan:

```bash
docker exec devclasses-mariadb mariadb -uroot -pdcl_local_dev_pw -N -B -e "SELECT 'question', COUNT(*) FROM question UNION ALL SELECT 'chapter', COUNT(*) FROM chapter UNION ALL SELECT 'subject', COUNT(*) FROM subject UNION ALL SELECT 'examsession', COUNT(*) FROM examsession UNION ALL SELECT 'studentresult', COUNT(*) FROM studentresult UNION ALL SELECT 'user', COUNT(*) FROM user UNION ALL SELECT 'video', COUNT(*) FROM video UNION ALL SELECT 'file', COUNT(*) FROM file UNION ALL SELECT 'migrations', COUNT(*) FROM _prisma_migrations;" u230057826_devclasses_new
cd "d:/Dev Classes (new website)/devclasses-backend" && npm run build && npx jest
cd "d:/Dev Classes (new website)/devclasses-frontend" && npm run build
cd "d:/Dev Classes (new website)/devclasses-mobile" && npx tsc --noEmit
```

Expected school row counts — these must not move:

| Table | Rows |
|---|---|
| question | 4924 |
| chapter | 101 |
| subject | 9 |
| examsession | 37 |
| studentresult | 33 |
| user | 14 |
| video | 0 |
| file | 0 |
| _prisma_migrations | 16 |

Expected build results: backend `npm run build` exit 0, `npx jest` **203 passed / 203**, frontend
`npm run build` exit 0, mobile `npx tsc --noEmit` exit 0.

---

## 7. Known gaps — expected behaviour, not bugs

Do not raise these as failures.

1. **Replaced files are not deleted from storage.** Uploading a replacement video, thumbnail or
   PDF — or switching a note from PDF to text — leaves the previous file on disk. Only deleting
   the row deletes its files. This used to be harmless; now that files sit on the VPS's own disk
   it costs **finite space**, so the sweeper job is worth scheduling sooner. Still not a test
   failure.
2. **Signed links expire.** Playback and PDF links are signed GETs valid for 5 minutes; upload
   PUTs are valid for 15. "Get a fresh link" is the intended recovery, not a workaround.
3. **All three content tabs load at once.** That is deliberate — it is what lets every tab label
   carry a real count and makes tab switching instant. It does mean the Videos and Notes tables
   can show a loading state together, because they share one Redux slice.
4. **The signed upload path has never run against real VPS storage.** It is unit-tested only.
   Step D2.5 is where that gets settled for the first time, and D2.8a is where range-based
   scrubbing gets settled for the first time.
5. **`src/api/apis.ts`'s 401 handler redirects to `/college/login`, which does not exist yet.**
   Unreachable from the portal today; it lands with the mobile screens.
6. **`devclasses-mobile`'s API base defaults to `http://localhost:5000/api`**, while school routes
   are served at the root and college routes at `/api/v2/...`. Pre-existing — confirm
   `EXPO_PUBLIC_API_ENDPOINT` before the first real mobile request in module J.
7. **The storage routes carry no `authCheck`.** Their authorisation *is* the HMAC signature, the
   same way a presigned object-store URL's was — a `<video src>` and a browser PUT cannot carry a
   session. Deliberate, not an oversight.
8. **Only one copy of every uploaded file exists.** Object storage replicated them; one VPS disk
   does not. Nothing in this plan tests backups because no backup destination has been chosen yet.

---

## 8. Sign-off

| Module | Tester | Date | Result |
|---|---|---|---|
| A — Navigation & shell | | | |
| B — Dashboard product switcher | | | |
| C — College Curriculum | | | |
| D.1 — Content shell & tabs | | | |
| D.2 — Videos | | | |
| D.3 — Notes | | | |
| D.4 — Practice | | | |
| E — College Orders | | | |
| F — Mobile Users | | | |
| G — Device Transfer Requests | | | |
| H — Responsive & accessibility | | | |
| I — School regression | | | |
| J — End-to-end with the app | | | |
