import { type Reading, readings } from "./readings";

// Transcribed against the retained pixels of Choisy pp.12–13. PHI's modern
// text is a comparison, not the source of these readings. Initial case normalized.
const passage = readings.find((r) => r.id === "public");
if (!passage) throw new Error("Missing the public-passage reading.");

export const visibilityReadings: Reading[] = [
  {
    ...passage,
    note: "The beneficiary is the people, not a named official. The later chest clause states a purpose of seeing while passing. Neither clause describes an inspection ritual, proves actual public use, or specifies our viewer's position.",
  },
  {
    id: "chests",
    title: "Chests made to a pattern",
    lines: "85–87",
    pages: [40],
    greek:
      "ποιήσει δὲ καὶ κιβωτοὺς τοῖς ἱστίοις καὶ τοῖς παραρρύμασιν τοῖς λευκοῖς, ἀριθμὸν ἑκατὸν τριάκοντα τέτταρας, πρὸς τὸ παράδειγμα ποιήσας,",
    english:
      "Make chests too, for the sails and the white side-hangings, one hundred and thirty-four in number, making them according to the pattern.",
    note: "The pattern (παράδειγμα) is mentioned, but no chest width or depth is supplied in this excerpt. Our two four-foot squares are illustrative. We do not derive a complete arrangement of the 134 chests, identify their contents point by point, or treat naval equipment as modern ammunition.",
    words: [
      {
        form: "κιβωτοὺς",
        lemma: "κιβωτός",
        meaning: "chests / boxes",
        work: "Containers whose faces can be opened in the next clause.",
      },
      {
        form: "τοῖς ἱστίοις",
        lemma: "ἱστίον",
        meaning: "for the sails",
        work: "Names one kind of naval equipment to be stored.",
      },
      {
        form: "πρὸς τὸ παράδειγμα",
        lemma: "παράδειγμα",
        meaning: "according to the pattern / model",
        work: "The written excerpt points beyond itself to a supplied pattern. Our square chest is not that ancient pattern.",
      },
    ],
  },
  {
    id: "front",
    title: "By the wall: the front",
    lines: "88–89",
    pages: [41],
    greek: "καὶ ποιήσει ἀνοιγνυμένας, τῶμ μὲν πρὸς τῶι τοίχωι κειμένων τὸμ πρόσθιον τοῖχον,",
    english: "And make them open: for those lying by the wall, [open] the front wall.",
    note: "The supplied English verb in brackets makes the abbreviated construction readable. The printed τῶμ and τὸμ are retained; they are assimilated forms, not misspelled menu labels. 'Front' in the drawing means the chest face toward the passage. No hinge or door swing is reconstructed.",
    words: [
      {
        form: "ἀνοιγνυμένας",
        lemma: "ἀνοίγνυμι",
        meaning: "opening / being opened",
        work: "The sides can be opened; this does not say that every panel stood permanently open.",
      },
      {
        form: "πρὸς τῶι τοίχωι",
        lemma: "πρός + dative; τοῖχος",
        meaning: "by the wall",
        work: "Selects the wall-side chests, not every chest in the building.",
      },
      {
        form: "τὸμ πρόσθιον τοῖχον",
        lemma: "πρόσθιος; τοῖχος",
        meaning: "the front wall / face",
        work: "Open the face toward the passage for this group.",
      },
    ],
  },
  {
    id: "sides",
    title: "By the pillars: both sides",
    lines: "89–91",
    pages: [41],
    greek: "τῶν δὲ κατὰ τοὺς κίονας κειμένων ἀμφοτέρους τοὺς πλαγίους τοίχους,",
    english: "But for those lying by the pillars, [open] both side walls.",
    note: "The μὲν … δὲ contrast divides two groups of chests. Both side walls is stronger than either one side or a generic 'open chest'. The following sightline experiment does not prove that this was the only geometry able to reveal any contents.",
    words: [
      {
        form: "κατὰ τοὺς κίονας",
        lemma: "κατά; κίων",
        meaning: "by / in line with the pillars",
        work: "Selects the second chest group. Its exact offset and size are chosen in our diagram.",
      },
      {
        form: "ἀμφοτέρους",
        lemma: "ἀμφότερος",
        meaning: "both of the two",
        work: "Opening one side alone fails this stated two-side requirement.",
      },
      {
        form: "τοὺς πλαγίους τοίχους",
        lemma: "πλάγιος; τοῖχος",
        meaning: "the side walls / faces",
        work: "These are different faces from the front named for the wall chests.",
      },
    ],
  },
  {
    id: "seeing",
    title: "So people passing through can see",
    lines: "91",
    pages: [41],
    greek: "ὅπως ἂν ἦι ὁρᾶν ἅπαντα τὰ σκεύη διεξιοῦσιν,",
    english: "So that those passing through can see all the equipment.",
    note: "This is the purpose clause, ending at Choisy's comma; the following wording is not silently merged with the different modern IG reading. 'Passing through' motivates moving the viewer, but our 41 positions and two sample points are modern choices. Seeing those points is a much weaker test than seeing all the equipment.",
    words: [
      {
        form: "ὁρᾶν",
        lemma: "ὁράω",
        meaning: "to see",
        work: "The stated purpose concerns visibility. It does not give the optical assumptions of this model.",
      },
      {
        form: "ἅπαντα τὰ σκεύη",
        lemma: "ἅπας; σκεῦος",
        meaning: "all the equipment",
        work: "Two visible sample points cannot establish this universal claim.",
      },
      {
        form: "διεξιοῦσιν",
        lemma: "διεξέρχομαι",
        meaning: "for those passing through",
        work: "The people move through; they are not required here to stand on our centre mark.",
      },
    ],
  },
];
