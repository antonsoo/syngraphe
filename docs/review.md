# Read a clause, change a building

The learner can correct an inclusive width reading, expose a wrong shaft segment
inside a matching total, compare two modern grids under selected measurements,
and find the relevant Greek in a retained printed edition. The drawings keep
prescribed dimensions, derived values and modern choices separate.

## Try the actual work

1. Open the workshop's first experiment. It begins with fifteen **clear** feet.
   The schematic total is 60½, exceeding the prescribed fifty-five. Include the
   pillar inside the fifteen and inspect the 12¼-foot clear side floor.
2. Keep all seven shaft segments at four feet and press **Make the total thirty**.
   A two-foot capital makes the sum fit while the first-segment clause still
   fails. Select five feet for the first segment, then fit the total again.
3. Change the modern end gap between five and seven feet. The count remains 35
   per row while the exact centre spacing changes. Select support 35 and inspect
   its position from the outer end.
4. Read the Greek, select a phrase for its contextual meaning, then open its whole
   source page. The breadth and outer-width clauses cross printed page breaks;
   both pages are available.
5. Save the illustrated reading. Reopen it without scripts, use its native
   records, and print the complete source-backed study.

![Measured width account](assets/width.png)

[Greek reading](assets/greek.png) · [Phone controls](assets/phone.png) ·
[Actual retained examples](../examples).

## Observed boundaries

This records the local production edition reviewed on 2026-10-27 UTC. Public
bytes, remote source, Pages delivery and remote CI are separate claims.
The subsequent [publication review](publication.md) records them.

| Boundary          | Observation                                                                                                                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Historical source | Ten complete images reproduce byte-for-byte from the pinned 21,126,116-byte Choisy PDF with Poppler 24.02.0. Title, text, editorial argument and reconstruction plates are identified separately.                                                                                                              |
| Arithmetic        | Independent Python `Fraction` formulas verify both width readings, 130 stack combinations, all 129 permitted end gaps and 4,515 exact support positions, including endpoint symmetry and non-overlap.                                                                                                          |
| Source checks     | Lint, strict types, seven substantive model/record tests and production build pass under Node 24.21.0. A fresh local clone with `--no-local` and `npm ci` passes the same checks; all 20 built files match the independently built checkout.                                                                   |
| Browser operation | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 pixels: keyboard width/stack decisions, false matching total, exact end-gap change, last support, enlarged-drawing/page panning, all eight readings and twenty-two word notes.                                                                  |
| Source display    | All ten displayed blob images match manifest lengths and SHA-256 values; full images decode at 2500 pixels high. Contextual source navigation moves keyboard focus to the source heading.                                                                                                                      |
| Records           | Real JSON/CSV/SVG/HTML downloads; malformed import rejected without changing the model; valid reimport and explicit share-link restoration work. Each CSV row retains settings and dimensional/evidence scope.                                                                                                 |
| Offline           | Current controller and complete cache inventory in every configuration. Local origin then refuses connections and browser networking is disabled. Reload, a new 97-finger end gap, another source image and new native/illustrated downloads work.                                                             |
| Retained reading  | Each actual HTML file embeds ten correct source images, the actual local font and complete MIT/OFL licenses. It contains no script and makes no remote asset request. Script-disabled native JSON/CSV/SVG downloads match the originals in both engines and widths.                                            |
| Print             | Actual Chromium PDF: 23 pages; all sixteen complete Greek/English passages, all twenty-two contextual word notes and ten source captions; 2,052 extracted words within the checked margins. Each drawing heading now stays with its plate.                                                                     |
| Faults            | Both engines: a late source cannot replace a newer selection; an HTTP 200 containing a different page is refused by viewer and illustrated export and cannot establish complete offline readiness. Valid bytes recover. A delayed export retains its initial settings even when controls change during saving. |
| Accessibility     | Zero requested axe WCAG 2 A/AA and 2.1 AA violations in all four configurations, with separate keyboard exercises. This is not a complete accessibility audit.                                                                                                                                                 |
| Visual inspection | Representative desktop and phone views in both engines, actual retained reading, SVG and print pages were inspected directly. Document overflow is checked in all configurations; the long plan and enlarged pages scroll within named keyboard regions.                                                       |

[Clean build](verification/clean-build.json) · [Exact oracle](verification/model.json) · [Source reproduction](verification/sources.json) ·
[Font identity](verification/font.json) · [Browser replay](verification/browser.json) ·
[Actual files and PDF](verification/artifacts.json) · [Fault cases](verification/faults.json).

The font's actual SFNT names identify Noto Serif Regular, Version 2.015, and the
2022 Noto Project copyright matching the retained OFL notice. The original font
bytes and licenses are compared independently inside every retained HTML.

The source and model have important limits: see [the formulas](model.md) and
[source/transcription account](sources.md). The selected constraints do not
validate a whole reconstruction; the new English has not received independent
philological review. The PDF is untagged and no physical printer result is
asserted. SVG text uses a viewer's installed serif font.

## Reproduce

```sh
npm ci
npm run check
npm run verify:model
npm run verify:sources
npm run test:browser -- /tmp/syngraphe-review
python3 scripts/artifacts.py /tmp/syngraphe-review
npm run test:faults -- /tmp/syngraphe-faults
```

The browser script serves the production build and stops its own origin during
offline checks. An optional final public base URL replays HTTPS behavior without
attempting to stop the remote server. Public offline results must therefore be
reported as browser-network-disabled, not origin-disabled.
