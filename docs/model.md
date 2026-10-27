# A measured reading, not a complete reconstruction

The workshop tests selected numerical clauses in the Piraeus storehouse
specification, **IG II² 1668**. A closing equation establishes agreement within
this stated account. It does not validate every feature of a historical building.

## Units and exact arithmetic

One foot contains four palms or sixteen fingers, following the units note in
the retained printed edition. Source dimensions become whole numbers of fingers.
The chosen end gap moves in whole-finger steps. Grid centres and spacings use
reduced rational numbers. These bounded values stay well within JavaScript's
safe integer range. Screen coordinates use floating point only for drawing.
Decisions and native records use integer arithmetic or exact fractions.

| Prescribed quantity               | Feet | Fingers | Reference                                  |
| --------------------------------- | ---- | ------- | ------------------------------------------ |
| Overall width including walls     | 55   | 880     | lines 6–7                                  |
| Each side strip including support | 15   | 240     | lines 10–11; partial restoration disclosed |
| Passage between supports          | 20   | 320     | lines 12–14                                |
| Upper wall body                   | 2½   | 40      | lines 26–28                                |
| Support breadth at its base       | 2¾   | 44      | lines 42–43                                |
| Total support including capital   | 30   | 480     | line 43                                    |
| Ordinary shaft segment            | 4    | 64      | lines 43–44                                |
| Exceptional first shaft segment   | 5    | 80      | lines 44–45                                |

The nominal length is four plethra, interpreted as 400 feet, or 6,400 fingers.
The selected count clause gives 35 supports per row. There are two rows.

## Width: the inclusive preposition changes the clear floor

The simplified account uses the prescribed **upper wall body** and **base
support breadth**. It does not model wider lower wall courses or taper.

```text
2½ wall | 12¼ floor | 2¾ support | 20 passage | 2¾ support | 12¼ floor | 2½ wall
        |------ 15 including ---|            |--- 15 including ------|
        total: 2 × 2½ + 2 × 12¼ + 2 × 2¾ + 20 = 55 feet
```

Reading fifteen as clear floor adds the support beyond that allowance:

```text
2 × 2½ + 2 × 15 + 2 × 2¾ + 20 = 60½ feet
60½ − 55 = 5½ feet too wide
```

The 12¼-foot clear floor is a derived value under the stated profile. It is not
a separate floor measurement quoted from the inscription or excavated remains.

## Height: a correct sum can still use the wrong segment

The source gives seven shaft segments, ordinary length four feet, but the first
five. The shaft therefore totals `5 + 6 × 4 = 29` feet. The thirty-foot total
already includes the capital, leaving one foot under this additive account.
A one-foot capital is an inferred residual, not a separate prescribed height.

Seven equal four-foot segments plus a two-foot capital also total thirty. This
passes the total-height equation while contradicting the first-segment clause.
The workshop keeps the two conditions separate. It never labels a model
source-compatible merely because its total matches.

Capital height can be selected from 0 through 64 fingers. The top profile and
shaft widths in the stack drawing are schematic. Structural loads and taper are
not inferred from these blocks.

## Longitudinal grid: what the selected constraints leave open

Add explicit modern assumptions: equal centre spacing, symmetric end gaps and
square breadth markers. Let `e` be the clear gap from the inner end-wall face to
the nearest support edge. With `w = 2½`, `d = 2¾`, `L = 400`, `n = 35`, in feet:

```text
first centre = w + e + d/2
last centre  = L − w − e − d/2
spacing      = (L − 2w − 2e − d) / (n − 1)
centre i     = first centre + i × spacing,  i = 0 .. 34
clear bay    = spacing − d
```

Five-foot and seven-foot end gaps give different centre positions while keeping
the selected length, count and width. All 129 permitted gaps from four through
twelve feet (whole-finger steps) give non-overlapping supports in this model.
This demonstrates underdetermination by the **selected clauses**. It does not
prove that every grid satisfies the full inscription, roof, doors, storage,
masonry coursing or archaeological evidence. It does not assert that the full
programme lacks enough information to constrain those choices.

The grid sheet uses the corrected schematic cross-width layout independently of
the first experiment. Otherwise changing an intentionally wrong width reading
would silently change the meaning of a separate longitudinal exercise.

## Records and retained drawings

JSON records identify version 1 and the `selected-clauses` scope. Import rejects
unknown/missing fields, out-of-range or fractional settings, and other formats.
Unknown or duplicate URL parameters reject the whole link's settings. Controls
retain the last valid model when a number entry is invalid.

CSV rows carry the selected width reading, first-segment length, capital and end
gap on every row. Values are integer numerator/denominator pairs **in fingers**.
They distinguish prescribed values, derived account values and modern grid
choices. The 35 centre rows describe one row's longitudinal positions; the
second row repeats those positions across the passage.

The standalone SVG is a modern drawn study with source and assumption labels.
The illustrated HTML embeds all eight readings and contextual notes, ten whole
source images, font and full licenses. Native JSON, CSV and SVG downloads inside
it need no JavaScript. Saving captures settings when the action begins, even if
a control changes while source bytes are being gathered.

Source display and illustrated export verify file length and SHA-256. The
viewer decodes each candidate in an independent image and ignores late
responses for previously selected pages. HTTP 200 alone cannot approve a source.
The service worker installs a complete integrity-checked edition and readiness
requires that current worker to control the page with all expected files cached.

## Independent checks

The Python oracle uses `fractions.Fraction` and foot-based formulas, independently
of the TypeScript's finger-based implementation. It checks both width readings,
130 first-segment/capital combinations, all 129 allowed end gaps and 4,515 exact
support positions, including symmetry, non-overlap and both end clearances.
Actual browser downloads receive a separate native-file audit; passing a core
oracle is not a claim about the delivered HTML, PDF or public server.
