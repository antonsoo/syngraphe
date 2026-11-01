# Seeing while passing: public delivery audit

Reviewed on **2026-11-01 UTC**. The sightline room is available at
[the canonical lesson](https://antonsoo.github.io/syngraphe/seeing.html#sightline),
alongside the existing measurement workshop. Both use the same offline edition.
The [source/model review](visibility-review.md#try-the-actual-work) explains what
the chosen two-point geometry can establish and what it leaves open.

## Slow-connection update

The current application is the correction at
`233bf83f3de68b6b7d09a2609ddb053f35ded9c7`, deployed to `gh-pages` at
`dee6a56531717f46674a2821d44482a9b522c92d`. A fresh Node 24.22.1 installation and
full check produce the same 26 files as the working build; all 26 canonical
hosted files match that corrected build:
[clean build](review/seeing/slow/clean-build.json),
[hosted bytes](review/seeing/slow/hosted-bytes.json),
[immutable changed source and workflow observations](review/seeing/slow/source-and-workflows.json).

Both rooms repeat their actual public journeys in Chromium and Firefox at
1440 and 375 pixels. Every offline replay cuts real TLS connections and proves
that a fresh worker-free page cannot load. The public repair sequence also
passes in both engines. Actual script-free downloads retain the complete
source/font/license bytes and native files; both PDF content audits pass:
[seeing](review/seeing/slow/seeing-browser.json),
[measurements](review/seeing/slow/measurement-browser.json),
[repair](review/seeing/slow/public-repair.json),
[seeing artifacts](review/seeing/slow/seeing-artifacts.json),
[measurement artifacts](review/seeing/slow/measurement-artifacts.json).
All four new sightline screenshots are byte-identical to the previously
inspected views; this correction changes transfer handling, not the drawing.

The [controlled shared-bandwidth review](visibility-review.md#slow-connection-correction)
records the reproduced 25-second installation failure and 15-second reading
failure, successful ~55-second installation and ~40-second reading afterward,
and continued refusal of a stalled body. The retained examples keep the same
Greek, geometry and source files. The earlier publication observations below
remain a record of the first hosted edition. Repository CI still executed no
steps at the corrected source revision; Pages delivery is recorded separately.

## Initial publication observations

| Boundary              | Observed evidence                                                                                                                                                                                                                                         | Receipt                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed application  | Independent clone of `fad6ed369f0514fb617a7485054db951f7f68738`; clean installs and full checks on Node 26.7.0 and 24.22.1 produce the same 26 files                                                                                                      | [Clean build](review/seeing/audited-clean-build.json)                                                                                    |
| Published source      | Remote `main` observed at `ababe527e6057ac72705f76734d9aadb8d8a146e`; 17 immutable raw files, including the review, pages, font, licenses and actual retained examples, match committed bytes                                                             | [Source identity](review/seeing/public/source-and-workflows.json)                                                                        |
| Pages artifact        | `gh-pages` at `3afba2a4fe65772d65381ca49b89e918d77741a5`; configured branch source; platform build and deployment completed                                                                                                                               | [Observed workflows](review/seeing/public/source-and-workflows.json)                                                                     |
| Canonical bytes       | Root, explicit index and all 26 current build files match lengths and SHA-256 values; root rechecked after the asset pass                                                                                                                                 | [Hosted comparison](review/seeing/public/hosted-bytes.json)                                                                              |
| Sightline room        | Chromium/Firefox at 1440/375: room entry, face choices, position, all fifteen Greek notes, four decoded verified source pages, records, imports, explicit sharing, portable reading                                                                       | [Seeing journey](review/seeing/public/seeing-browser.json)                                                                               |
| Measurement room      | Same four configurations: exact width/height/grid decisions, all readings and twenty-two notes, twelve source images, records, sharing, portable reading                                                                                                  | [Measurement journey](review/seeing/public/measurement-browser.json)                                                                     |
| Saved bytes and print | Native embedded downloads match; actual page/font/license bytes match; complete Greek/English, notes and captions retained in 17-page and 25-page PDFs; checked text stays within margins                                                                 | [Seeing artifacts](review/seeing/public/seeing-artifacts.json), [measurement artifacts](review/seeing/public/measurement-artifacts.json) |
| Offline transport     | Original TLS passes unchanged through CONNECT. Existing tunnels then close and new connections are refused. A separate fresh context with workers blocked fails before each saved-room replay                                                             | [Seeing proof](review/seeing/public/seeing-browser.json), [measurement proof](review/seeing/public/measurement-browser.json)             |
| Public repair         | Chromium/Firefox at 375: missing image, authentic wrong-page cache bytes and whole-cache eviction detected; disconnected repair fails; real network repair succeeds and preserves settings; offline reload and actual illustrated download work afterward | [Repair proof](review/seeing/public/repair.json)                                                                                         |
| Repository CI         | The source CI and source Pages jobs at the observed revision completed with failure and **zero executed steps**; local checks and platform Pages delivery do not establish repository CI success                                                          | [Job observations](review/seeing/public/source-and-workflows.json)                                                                       |

The deployment retains earlier hashed assets for readers holding an older entry
page. They are separate from the current 25-file worker inventory. The worker
itself is the 26th build file and is not part of its own cache. No tag or package
registry release was made.

## Why the public offline check changed

A negative control exposed a limitation in the earlier browser flag: Firefox's
worker repaired a deleted cache entry while `navigator.onLine` was false and a
page fetch rejected. That flag alone did not prove that the worker could no
longer obtain the bytes. The current public review therefore cuts the transport
itself, verifies a fresh uncached failure, and then operates the retained room.
It also proves that repair fails during that cutoff and works after restoration.
The hosted origin remains running; it is unreachable to the audited browser.
The independent local review additionally stops its own server.

## Repeat the public review

Build the current source first. The public build must match that build before
interpreting a replay as verification of the same edition.

```sh
npm ci
npm run build
npm run test:seeing -- /tmp/syngraphe-public-seeing https://antonsoo.github.io/syngraphe/
npm run verify:seeing-artifacts -- /tmp/syngraphe-public-seeing
npm run test:browser -- /tmp/syngraphe-public-measurements https://antonsoo.github.io/syngraphe/
python3 scripts/artifacts.py /tmp/syngraphe-public-measurements
node scripts/public-repair.mjs https://antonsoo.github.io/syngraphe/ /tmp/syngraphe-public-repair
```

The scripts use the real host's authenticated TLS bytes, with no lesson-response
substitution. Browser screenshots and representative print pages were inspected.
The PDFs are untagged; physical printing remains unverified. New English and
word notes have not received independent philological review. The two-point
model does not reconstruct the ancient chest pattern, all 134 chests, or the
historical visibility of all equipment.

The initial [HTTP-404 boundary](review/seeing/publication-boundary.json) and
[original clean-build receipt](review/seeing/clean-build.json) remain historical
records. They are not the current hosted edition's identity. Documentation added
after the recorded source observation does not change the application build.
