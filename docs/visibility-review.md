# Seeing while passing: local review

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
| Print              | The 17-page PDF retains ten complete Greek/English passages, fifteen complete notes, four source captions and 2,285 extracted words within checked margins                                                     | [reading.pdf](../examples/seeing/reading.pdf)                          |
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

## Reproduce the review

```sh
npm run check
npm run verify:model
npm run verify:visibility
npm run verify:sources
npm run test:seeing -- /tmp/syngraphe-seeing-review
npm run verify:seeing-artifacts -- /tmp/syngraphe-seeing-review
npm run test:seeing-faults -- /tmp/syngraphe-seeing-faults
npm run test:browser -- /tmp/syngraphe-measurement-review
python3 scripts/artifacts.py /tmp/syngraphe-measurement-review
```

Python 3 and Poppler are required for source/print audits. Use existing local
Playwright Chromium/Firefox installations; no browser installation was needed
in this review. An optional third argument to `scripts/seeing-faults.mjs` supplies
a previous production directory for the two-tab handover check.

## Publication boundary

This is local completed work. The read-only check found remote `main` at the
unchanged starting revision and `seeing.html` returning HTTP 404:
[publication-boundary.json](review/seeing/publication-boundary.json).
No push, Pages deployment, tag, registry publication or remote CI success is
claimed. The house standards reserve publication for the coordinator.

Build with `npm run build`; deploy the complete **`dist/`** directory under
**`/syngraphe/`**. Publish the source review and this lesson before deploying
Officina's staged search entry. Afterwards, verify canonical hosted bytes and
the real public search -> lesson -> source/review -> portable-reading journey
independently. The local receipt does not substitute for that public review.

Suggested repository description: “Read Greek building instructions, test their
geometry and sightlines, and keep the source evidence.” Topics: `ancient-greek`,
`architecture`, `epigraphy`, `geometry`, `education`, `offline-first`.
