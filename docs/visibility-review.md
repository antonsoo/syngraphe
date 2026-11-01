# Seeing while passing: source and browser review

The added room develops an architectural purpose already present in the
storehouse programme: people passing through should be able to see the naval
equipment. It lets the learner change opening faces and viewer position,
read the contrast in Greek, and take the selected experiment away with its
printed evidence. No new repository was created.

## Try the actual work

```sh
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4351/syngraphe/seeing.html#sightline`.
Use **both fronts**, walk the chosen path, then compare **the stated faces**.
Both samples can be seen somewhere under the first choice while the pillar
opening contradicts the words. Agreeing with the two opening clauses also
does not guarantee a sample is visible from the centre position.

The [source and model account](visibility.md) identifies the exact clauses,
modern geometry, closed-corner rule and omissions. New English and word notes
have not received independent philological review. The two square chests and
samples are not the supplied ancient pattern or a complete reconstruction.

## Observed behavior

| Boundary           | Actual check                                                                                                                                                                                                   | Retained evidence                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Source             | Refetched the pinned 21,126,116-byte Choisy PDF; reproduced all twelve whole-page images and hashes                                                                                                            | [sources.json](review/seeing/sources.json)                             |
| Numerical model    | Independently specified foot-based vector intersections agree with integer eighth-foot calculations for all 2,050 sample rays and exact first obstructions                                                     | [visibility_oracle.py](../scripts/visibility_oracle.py)                |
| New room           | Chromium and Firefox, 1440 and 375 pixels; measurement-room entry, face choices, keyboard station/word operation, fifteen notes, four decoded source images, explicit share, invalid imports, native downloads | [browser.json](review/seeing/browser.json)                             |
| Accessibility      | No axe violations in those four operated configurations; no document-width overflow; enlarged drawing/page support keyboard panning                                                                            | [browser.json](review/seeing/browser.json)                             |
| Portable reading   | Both browsers reopen the HTML with scripts disabled; native JSON/CSV/SVG downloads match the direct downloads; source/font/license bytes match; no remote asset requests                                       | [artifacts.json](review/seeing/artifacts.json)                         |
| Print              | The 17-page PDF retains ten complete Greek/English passages, fifteen complete notes, four source captions and 2,331 extracted words within checked margins                                                     | [reading.pdf](../examples/seeing/reading.pdf)                          |
| Offline            | Current controller and complete 25-file inventory verified; origin stopped before reload, source reading and export; cold new-room install also opens the measurement room                                     | [recovery.json](review/seeing/recovery.json)                           |
| Recovery           | Authentic but substituted page refused despite HTTP 200; retry recovers; changing controls during a delayed source fetch preserves the save's starting state; cancellation emits no late download              | [recovery.json](review/seeing/recovery.json)                           |
| Edition handover   | Real previous local production build -> new room in another tab; edited measurement tab retains its end gap and derived result; old cache cleanup settles; new room reloads with the origin stopped            | [recovery.json](review/seeing/recovery.json)                           |
| Missing cache file | Fresh inspection reports incomplete; illustrated export cannot supply missing evidence while the origin is stopped                                                                                             | [recovery.json](review/seeing/recovery.json)                           |
| Existing room      | Four complete browser configurations; independent exact measurement audit; 25-page current reading with sixteen complete Greek/English passages, twenty-two notes and twelve source captions                   | [measurement-artifacts.json](review/seeing/measurement-artifacts.json) |

The edition-handover fixture was the unchanged production build made before
this work. Cache cleanup is asynchronous; the review waits for it to settle
instead of treating controller change as proof that every old cache is gone.
The fixture is not a claim about an independently hosted upgrade.

The main journey exposed a long-hash overflow in the retained HTML at 375 pixels;
both export formats now wrap long values. The expanded source selector also
requires accepting pages 40 and 41 in measurement records; those records now
round-trip. New measurement exports use the current author name.

The illustration remains an overview on a phone: fine SVG labels need the
enlarge control. Full opening/result text is ordinary page text. Screenshots
were inspected in both browsers and both widths:
[desktop](assets/seeing-desktop.png), [phone](assets/seeing-phone.png).
Printed drawing and Greek-note pages were rendered and visually inspected too.
The PDF is untagged; physical printer behavior remains unverified.

## Audit corrections

A second review found and corrected three learner-facing defects:
- A cache missing a source page stayed incomplete after reconnecting, with no
  repair control. Both rooms now offer **Check offline copy** and **Save offline
  copy again**. Inspection verifies every retained file's SHA-256, not just its
  presence. Returning to the tab rechecks readiness. Repair verifies a complete
  network batch before committing it and leaves the current settings intact.
- An HTTP error from a reachable host replaced a correctly retained room.
  Navigation now uses the retained room for failed HTTP responses as well as
  failed connections. Unknown URLs retain their error response.
- “All faces closed” blurred an openable design with a temporarily closed panel.
  The choice is now **No opening faces**. Controls, English, notes, SVG and the
  portable reading explain that the test holds all selected opening faces open;
  the clause specifies which faces can open, not permanent panel positions.

The actual cache-mutation review covers a missing image, authentic wrong-page
bytes already in Cache Storage, complete cache eviction, failed requests,
HTTP-200 substitution during repair, successful retry, concurrent repair from
both rooms, preserved settings and real downloads after the origin stops.
Both Chromium and Firefox complete that sequence:
[offline-repair.json](review/seeing/offline-repair.json).
Inspection and ordinary fetches do not recreate a deleted named cache.

The measurement room's on-screen save text and source inventory now correctly
say twelve pages. Its checked-in HTML and 25-page PDF were refreshed from actual
browser downloads; the historical review below remains a record of its earlier
edition. Current PDF content has sixteen complete Greek/English passages,
twenty-two notes and twelve source captions. The source account lists both new
printed pages. The Pages workflow now matches the configured branch deployment.

## Slow-connection correction

A later shared-bandwidth review reproduced two timeout failures. At a nominal
128,000 bytes/s across all concurrent responses, the 25-second offline batch
limit aborted installation, while a fixed 15-second source timer aborted the
twelve-page measurement reading. The smaller four-page reading succeeded.
The source loader now distinguishes connection delay, body inactivity and total
time; an active body can continue beyond fifteen seconds. It checks the exact
length and SHA-256 and rejects excess bytes before allocating beyond the known
file size. Offline installation/repair allows a bounded three-minute batch.

Both browsers now finish installation after about 55 seconds and the twelve-page
reading after about 40 seconds under that same shared limit. Settings remain
operable, the reading captures its starting settings, and the installed rooms
work after their actual server stops. A twenty-second body stall is still
refused at the fifteen-second inactivity limit; authentic retry and download
recover. These are controlled local transfer observations, not a mobile-device
or public-network speed benchmark:
[before offline](review/seeing/slow/offline-before.json),
[before reading](review/seeing/slow/reading-before.json),
[smaller reading](review/seeing/slow/smaller-reading-before.json),
[after](review/seeing/slow/after.json),
[stalled body](review/seeing/slow/body-inactivity.json).
The four actual slow/offline HTML downloads retain exact source, font and
license bytes: [artifact check](review/seeing/slow/slow-artifacts.json).
An independent checkout at `233bf83` passes fresh `npm ci` and the full check on
Node 24.22.1, with all 26 build files byte-identical to the working build:
[clean build](review/seeing/slow/clean-build.json).
The latest [public delivery update](seeing-publication.md#slow-connection-update)
identifies this corrected edition separately from the initial public receipts.

The runner uses Node 26.7.0 on the local WSL2 Linux host, with two independent
browser/server pairs. Each server shares one 128,000-byte/s budget across all
responses. Its queue intentionally has no per-connection bandwidth multiplier.

```sh
node scripts/slow-connection.mjs /tmp/syngraphe-slow-connection
```

## Reproduce the review

```sh
npm run check
npm run verify:model
npm run verify:visibility
npm run verify:sources
npm run test:seeing -- /tmp/syngraphe-seeing-review
npm run verify:seeing-artifacts -- /tmp/syngraphe-seeing-review
npm run test:seeing-faults -- /tmp/syngraphe-seeing-faults
npm run test:offline-repair -- /tmp/syngraphe-offline-repair
npm run test:browser -- /tmp/syngraphe-measurement-review
python3 scripts/artifacts.py /tmp/syngraphe-measurement-review
```

Python 3 and Poppler are required for source/print audits. Use existing local
Playwright Chromium/Firefox installations; no browser installation was needed
in this review. After the output directory, an optional previous-production directory enables
the two-tab handover check in `scripts/seeing-faults.mjs`.

## Independent checkout and publication

The [public delivery audit](seeing-publication.md) records the canonical hosted
files, immutable source bytes, real browser journeys and transport-cut recovery.

The earlier clean-checkout receipt at `1a7aade` predates the audit corrections
above: [original clean-build receipt](review/seeing/clean-build.json). Its
26-file inventory is historical evidence, not the current edition's identity.
A fresh independent clone of `fad6ed3` passes `npm ci`, the full source check,
both exact model oracles, the four seeing-room configurations, the artifact
review, source/export faults, prior-edition handover, and offline repair in both
engines. Node 24.22.1 independently passes clean installation and the full check;
all 26 build files match the Node 26.7.0 build byte for byte:
[current clean-build receipt](review/seeing/audited-clean-build.json).
Public delivery receives separate byte and browser checks before the catalogue
is published. Build with `npm run build`; the
complete output is **`dist/`**, served under **`/syngraphe/`**.

The initial [publication-boundary receipt](review/seeing/publication-boundary.json)
records the pre-publication source heads and `seeing.html` HTTP 404. It does not
establish current public availability. No remote CI success is inferred from
local checks or a Pages response.

Suggested repository description: “Read Greek building instructions, test their
geometry and sightlines, and keep the source evidence.” Topics: `ancient-greek`,
`architecture`, `epigraphy`, `geometry`, `education`, `offline-first`.
