# Public source, retained study and live workshop

[Open Syngraphe](https://antonsoo.github.io/syngraphe/). Source and static files
were pushed on 2026-10-27 UTC under the owner's explicit authorization.

| Boundary               | Observed result                                                                                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public source          | Fresh HTTPS clone at `df73e49ddb22704079cf417ab3f2b64b20c7c9bc`, `npm ci`, Node 24.21.0, lint, strict types, seven substantive tests and production build. All 20 built files match the independently built checkout.                                                       |
| Documented quickstart  | The public-source checkout runs the documented dev command at port 4351. Chromium and Firefox at 1440/375 operate width and stack decisions, verify the source and save the illustrated reading. Development correctly identifies offline saving as production-only.        |
| Public static bytes    | All 20 canonical files match expected lengths and SHA-256 before and after the public browser matrix. Each pass checks root and index aliases again at the end.                                                                                                             |
| Public operation       | Chromium 153.0.8010.12 and Firefox 155.0 at 1440 and 375: real decisions, all eight readings/twenty-two word notes, ten displayed source identities, keyboard panning, records, imports and sharing.                                                                        |
| Public offline use     | Current controller and all 19 inventory entries; browser networking disabled, reload, new 97-finger end gap, another source image and new native/illustrated downloads. The remote origin was not stopped. `sw.js` is not itself an inventory entry.                        |
| Native artifacts       | Independently audited actual public JSON, CSV, SVG and script-free HTML; source/font/license bytes match. Embedded native downloads work with scripts disabled. The PDF retains all 16 complete Greek/English passages, all 22 complete word notes and ten source captions. |
| Origin-disabled replay | Separate matrix against the freshly built remote source: all four configurations with the local origin actually refusing connections, plus the same new offline operations and exports.                                                                                     |
| Fault behavior         | Both engines: late page ignored, HTTP 200 substitution refused by viewer/export/worker, recovery from valid bytes, settings captured before a delayed export. These faults were injected locally, not into the public server.                                               |
| Remote workflows       | CI and Pages workflows concluded failure before any job step ran. This review does not describe remote CI as passing. Local build checks and independently verified public delivery remain separate.                                                                        |

[Remote source/build](publication/remote-source.json) ·
[Development quickstart](publication/development.json) ·
[Canonical HTTPS before](publication/hosted-before.json) ·
[Public browser operation](publication/browser.json) ·
[Actual public files and PDF](publication/artifacts.json) ·
[Canonical HTTPS after](publication/hosted-after.json) ·
[Origin-disabled clean-source replay](publication/clean-browser.json) ·
[Source/export fault cases](publication/faults.json).

The Pages API reports a built legacy site from `gh-pages` at its root. Static
commit `272128e` contains the reviewed build and `.nojekyll`; no force push was
used. The ordinary Actions workflow remains available for a future working
runner. The failed remote workflow jobs contain no executed steps; public
availability was established independently through canonical bytes and actual
browsers.

The source correction from `6ad5a86` to `df73e49` formats two retained receipt/doc
files so the documented source check is reproducible. It changes no runtime
file. A prior pre-correction remote check was not counted as passing.

The [direct learner review](review.md), [source account](sources.md) and
[model assumptions](model.md) still apply. Public delivery does not establish
independent philological review, a complete historical reconstruction, tagged
PDF accessibility or a physical printer result.

To replay HTTPS operation after building:

```sh
node scripts/browser.mjs /tmp/syngraphe-public https://antonsoo.github.io/syngraphe/
python3 scripts/artifacts.py /tmp/syngraphe-public
```

To replay the documented development workflow, start `npm run dev`, then:

```sh
node scripts/quickstart.mjs http://127.0.0.1:4351/syngraphe/ /tmp/syngraphe-dev
```
