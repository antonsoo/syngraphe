# The printed specification and the drawing

Syngraphe reads selected clauses of **IG II² 1668**, the stone programme for a
naval equipment storehouse at Zea in Piraeus. The modern inscription catalogue
dates it **347/6 BCE**. The opening names **Euthydomos, son of Demetrios, of
Melite**, and **Philon, son of Exekestides, of Eleusis**. Names and attribution do
not by themselves establish every person's role.

The retained edition is **Auguste Choisy, _Études épigraphiques sur
l'architecture grecque_**, Paris, Librairie de la Société anonyme de publications
périodiques, **1884**. The volume's title page establishes that date. Its Arsenal
section reproduces Greek below Choisy's French translation; commentary and
reconstruction plates follow. The source is the Getty Research Institute copy
digitized by Internet Archive.

| Retained image | Printed location | Role                                                              |
| -------------- | ---------------- | ----------------------------------------------------------------- |
| PDF 15         | Title            | Edition identity                                                  |
| PDF 33         | p.5              | Opening, outer dimensions and editor's units note                 |
| PDF 34         | p.6              | Inclusive side strip, support count and public passage            |
| PDF 35         | p.7              | Upper wall blocks and width                                       |
| PDF 36         | p.8              | Beginning of support breadth clause                               |
| PDF 37         | p.9              | Breadth continued, total length, capital and segment exception    |
| PDF 46–47      | pp.18–19         | Choisy's reasoning about square pillars; editorial interpretation |
| PDF 73         | Plate I          | Choisy's reconstructed elevation and plans                        |
| PDF 75         | Plate II         | Choisy's reconstructed sections                                   |

The [manifest](../public/sources/manifest.json) records the original PDF URL,
21,126,116-byte length, SHA-256, renderer and each whole image's identity. The
PDF's SHA-256 is
`418e65e07dbdec0e0e2adc5d8dbbb47ec8d9e00f46bb6d52c0e5eed4d7991d15`.
Ten whole pages reproduce from that PDF with Poppler 24.02.0, `pdftoppm`,
`-scale-to 2500 -jpeg -jpegopt quality=88`.
The images preserve margins, original notes and French; no selected text is
painted into the source. The 1884 publication is public domain in the United
States; Choisy died in 1909. No modern museum photograph or modern copyrighted
reconstruction is bundled.

## Transcription and translation

The selected Greek was newly transcribed against these images. Line wraps and
end-of-line hyphens are removed; initial capitals are lowered; punctuation is
lightly regularized. Iota adscript spelling is retained. Restored letters remain
in brackets. In particular, Choisy prints `πέντε κ[αὶ δέκα]`; part of the number
fifteen is restored. The preposition `σύν` is outside that restoration. The app
does not present the complete number as an entirely preserved reading on stone.

The English and contextual word notes are new. “Length” for the vertical support
translates the actual `μῆκος`; the source does not use `ὕψος` in that clause.
“Stack segment” keeps the numerical exercise separate from the question of the
pillar's plan shape. “Drum” is a common translation of `σφόνδυλος` but does not
license silently treating every schematic support as a fluted circular column.
The English and word notes have not received independent philological review.

The [modern IG / PHI transcript](https://inscriptions.packhum.org/text/3893) is a
comparison reference for date, line numbering and text. It is not our bundled
edition. Restorations and punctuation can differ. The app identifies those
boundaries rather than claiming a diplomatic transcription of the original
stone. The book's French translation and its interpretations are also distinct
from the ancient text.

## Units and derived values

Choisy's p.5 footnote gives one palm as a quarter of a foot, and a finger as a
quarter of a palm. Thus one foot contains four palms or sixteen fingers. He also
suggests a modern metre equivalent; this workshop does not adopt it. Its native
records use integer fingers and exact fractions of fingers, preserving the
arithmetic independently of a modern foot-length estimate.

The long direction uses the conventional linear plethron of 100 feet:
[Perseus's Greek vocabulary entry](https://vocab.perseus.org/lemma/66444/)
and [Lexicon Thucydideum](https://atlas.perseus.tufts.edu/dictionaries/entry/urn%3Acite2%3Ascaife-viewer%3Adictionary-entries.atlas_v1%3Alexicon-thucydideum-3804/).
This is a unit interpretation, not an extra “400” written in the selected Greek.
No area plethron is being used.

The 12¼-foot clear side floor and one-foot capital are derived under the
[stated model assumptions](model.md); neither is presented as a separately
inscribed dimension.

## Reconstruction is an argument

On pp.18–19, Choisy argues that these supports have square sections. His
reconstruction plates implement that interpretation. Syngraphe retains both
reasoning and plates so the reader can distinguish a scholar's completed
building from the selected instructions. It does not endorse each feature of
the plates or settle the historical order, taper or capital profile.

Roland Martin's later _Note sur la charpenterie grecque d'après I.G., II², 1668,
ll.45–59_ (1987, pp.401–410) discusses disputed roof vocabulary and the effects
of interpretation on reconstruction. His opening also distinguishes this
programme from a price estimate: the text does not give prices.
[Read the paper at Persée](https://www.persee.fr/doc/efr_0000-0000_1987_ant_99_1_2743).
No part of that modern paper is redistributed here. The roof is outside this
workshop's model.

To reproduce the retained source identities:

```sh
python3 scripts/verify-sources.py
```

The script downloads the pinned public-domain PDF into a temporary directory,
checks its length and SHA-256, rerenders the selected whole pages and compares
actual bytes. A different Poppler version may produce different JPEG bytes;
inspect the images before considering an identity change.
