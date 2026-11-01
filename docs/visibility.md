# Seeing while passing

## Try the actual work

Run `npm ci && npm run build && npm run preview`, then open
`http://127.0.0.1:4351/syngraphe/seeing.html`.
1. Leave both chests on **Front only**. Each sample is visible somewhere along
   the chosen path, yet the pillar chest's opening differs from the Greek.
2. Choose **Use the stated faces**. The wall chest keeps its front opening;
   the pillar chest opens both sides. At the centre station the support still
   hides the pillar sample. Move to either end to see through a side.
3. Open only the left side of the pillar chest. Compare the two ends. One side
   can expose a sample from one direction, but it is not **both** sides.
4. Read **the front**, **both sides**, and **those passing through**. Select
   the Greek phrases and open the whole printed page. Enlarge either drawing
   or page and use arrow keys to pan.
5. Save JSON, CSV, SVG and the illustrated reading. Change the settings and
   reopen the JSON. The HTML carries the selected position, other positions,
   all 41 observations, five readings, fifteen word notes, four whole source
   pages, the local font, licenses and native downloads without scripts.

Seeing a point and agreeing with a face clause are separate observations.
Neither establishes compliance with the full specification or the historical
visibility of all stored equipment.

## Primary evidence

**IG II² 1668**, the Piraeus naval-storehouse programme, is dated 347/6 BCE in
the [modern inscription catalogue](https://inscriptions.packhum.org/text/3893).
Its equipment includes sails; this is not a modern ammunition depot.

The bundled edition is Auguste Choisy, _Études épigraphiques sur l'architecture
grecque_, Paris, 1884. The Getty Research Institute copy is retained through
[Internet Archive](https://archive.org/details/etudesepigraphiq00choi).
The PDF length and SHA-256 match the original source manifest. New page renders
were made with its existing Poppler settings, then inspected visually:

| Evidence                                   | Printed page | PDF page | Selected lines |
| ------------------------------------------ | ------------ | -------- | -------------- |
| Public passage and twenty-foot clear width | 6            | 34       | 12–14          |
| Chests, sails, 134 total, supplied pattern | 12           | 40       | 85–87          |
| Wall chests open at the front              | 13           | 41       | 88–89          |
| Pillar chests open at both side walls      | 13           | 41       | 89–91          |
| Seeing all equipment while passing         | 13           | 41       | 91             |

The title page (PDF 15) identifies the edition. Whole pages preserve Choisy's
French, Greek, notes and margins. Our transcriptions follow those pixels, not
an OCR stream. Initial case and excerpt punctuation are normalized; τῶμ and
τὸμ remain as printed. The purpose excerpt ends at Choisy's comma after
διεξιοῦσιν. We do not silently replace the following wording with the different
modern IG transcript. New English and contextual notes have not received
independent philological review.

The opening-face and purpose clauses support the distinction the learner
operates. They do not prescribe the software's optics, viewer position, chest
dimensions, isolated support or a civic inspection ritual. They do not by
themselves prove how the completed building was used.

## Modern geometry

The drawing reuses the earlier room's simplified cross-width account: a
2½-foot upper wall body, 2¾-foot support base breadth, fifteen feet including
that support, and a twenty-foot passage. It combines different height profiles
and treats the support as a square. Those simplifications remain explicit.

Coordinates are in feet. Increasing x runs along the passage; increasing y
runs from the passage toward one side wall. Front faces the passage (lower y).

| Object        | x interval                 | y interval | Evidence boundary                                           |
| ------------- | -------------------------- | ---------- | ----------------------------------------------------------- |
| Support       | −1⅜ to +1⅜                 | 20 to 22¾  | Base breadth from source; square shape and placement chosen |
| Pillar chest  | −2 to +2                   | 22¾ to 26¾ | Entire chest footprint chosen                               |
| Wall chest    | 5 to 9                     | 31 to 35   | Entire chest footprint chosen                               |
| Pillar sample | 0                          | 24¾        | Chosen point, not an inventory item                         |
| Wall sample   | 7                          | 33         | Chosen point, not an inventory item                         |
| Viewer        | −20 to +20, one-foot steps | 10         | Chosen path and stations                                    |

The wall's inner face is y = 35; its upper-body width is 2½. No metre value
is assigned to the ancient foot. Chest dimensions are not inferred from the
nearby four-by-three-foot board clause: the chest clause explicitly refers
to a supplied pattern. No arrangement of all 134 chests is claimed.

Closed chest faces and the support boundary are opaque line segments. An open
face is removed, with no hinged panel. For each sample the ray is the segment
from the current eye point to the sample. Its first intersection with a closed
edge blocks visibility, including closed corner contact. Other chests can
obstruct a ray too. Walls cannot intervene before these interior samples.

All coordinates are stored as integer eighth-feet. Intersection times are
rational numbers compared by cross multiplication. Floating point is used
only to draw the resulting point. Visibility is not decided by a rounding
tolerance. `scripts/visibility_oracle.py` independently uses foot-based
`fractions.Fraction` and general vector cross products against separately
specified geometry. It checks all 2,050 sample rays across 25 opening pairs
and 41 stations, including the identity and exact time of the first obstruction.

| Wall opening | Pillar opening | A visible stations | B visible stations | Selected face clauses |
| ------------ | -------------- | ------------------ | ------------------ | --------------------- |
| Front        | Front          | 23 / 41            | 8 / 41             | Pillar differs        |
| Front        | Both sides     | 23 / 41            | 12 / 41            | Both agree            |
| Front        | Left side      | 23 / 41            | 6 / 41             | Pillar differs        |
| Front        | Right side     | 23 / 41            | 6 / 41             | Pillar differs        |
| Front        | Closed         | 23 / 41            | 0 / 41             | Pillar differs        |

The path summary compares independent stations; it is not cumulative visit
history. A visible centre sample is much weaker than a visible entire chest,
let alone all equipment. The prescription is deliberately not forced to be
the unique arrangement revealing two invented points. Conversely, being
hidden at one station does not refute a purpose concerning people passing
through.

Neighbouring supports, grilles, doors, vertical geometry, storage tiers, objects,
people, illumination, refraction and structural behavior are omitted. Results
apply to this isolated two-dimensional experiment alone.

## Records and artifacts

Version 1 `syngraphe-sightline` JSON is distinct from the older measured-plan
record. Import requires the exact schema, known opening names, integer station
within −20…20, one of five readings and one of the four retained page choices.
Invalid files and duplicate/unknown URL settings leave the experiment intact
or show the default with an explanation. Links are copied explicitly; ordinary
control changes do not rewrite the address.

CSV contains two sample observations for every station, 82 data rows, carrying
the opening choices, first obstruction and both face-clause comparisons.
The SVG is independently viewable and names its model limits. The illustrated
HTML captures the state when saving begins, even while verified assets load.
It embeds the actual page/font/license bytes; a substituted HTTP 200 source
page is refused. Saving can be cancelled. Browser print yields an untagged PDF;
physical printer output is not verified.

## Publication boundary

This room is prepared locally. The public measurement workshop is an earlier
edition. The repository's house standards reserve pushes and publication for
the coordinator; this work does not push source, deploy Pages or assert remote
CI success. Publish the lesson and its review before deploying the staged
Officina discovery entry. Local browser operation and source-byte reproduction
are recorded separately from any future public verification.
