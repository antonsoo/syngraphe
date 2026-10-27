export interface WordNote {
  form: string;
  lemma: string;
  meaning: string;
  work: string;
}
export interface Reading {
  id: string;
  title: string;
  lines: string;
  pages: number[];
  greek: string;
  english: string;
  note: string;
  words: WordNote[];
}
export const readings: Reading[] = [
  {
    id: "outer",
    title: "The walls belong inside the fifty-five",
    lines: "6–7",
    pages: [33, 34],
    greek: "μῆκος τεττάρων πλέθρων, πλάτος πεντήκοντα ποδῶν καὶ πέντε σὺν τοῖς τοίχοις.",
    english: "Length: four plethra. Width: fifty-five feet, including the walls.",
    note: "The Greek runs across the page break. “With the walls” fixes what the outer width counts. A plethron is taken here as 100 feet. No modern metre value is assigned to the foot.",
    words: [
      {
        form: "μῆκος",
        lemma: "μῆκος",
        meaning: "length",
        work: "Four plethra describe the long direction.",
      },
      {
        form: "πλάτος",
        lemma: "πλάτος",
        meaning: "width",
        work: "The short direction is measured separately.",
      },
      {
        form: "σὺν τοῖς τοίχοις",
        lemma: "σύν + dative; τοῖχος",
        meaning: "including the walls",
        work: "The walls are inside the fifty-five-foot total.",
      },
    ],
  },
  {
    id: "inclusive",
    title: "Fifteen includes the pillar",
    lines: "10–11",
    pages: [34],
    greek: "ἀπολείπων ἀπὸ τοῦ τοίχου ἑκατέρου πέντε κ[αὶ δέκα] πόδας σὺν τῶι πάχει τοῦ κίονος.",
    english: "Leaving from each wall fifteen feet, including the thickness of the pillar.",
    note: "Choisy prints restored letters in brackets. This lesson retains them: the number fifteen includes editorial restoration. The preposition σύν is present outside those brackets. The side strip runs from the inner wall face to the passage-side edge of the support in this schematic plan.",
    words: [
      {
        form: "ἑκατέρου",
        lemma: "ἑκάτερος",
        meaning: "of each of the two",
        work: "Apply the side allowance at both walls.",
      },
      {
        form: "κ[αὶ δέκα]",
        lemma: "καὶ δέκα",
        meaning: "and ten",
        work: "Five plus ten gives fifteen. The brackets disclose restored letters.",
      },
      {
        form: "σὺν τῶι πάχει",
        lemma: "σύν + dative; πάχος",
        meaning: "including the thickness",
        work: "Subtract the support breadth to obtain clear side floor.",
      },
      {
        form: "τοῦ κίονος",
        lemma: "κίων",
        meaning: "of the pillar / column",
        work: "The measurement includes this member. The word alone is not an ornamental order or a complete profile.",
      },
    ],
  },
  {
    id: "count",
    title: "Thirty-five in each row",
    lines: "11–12",
    pages: [34],
    greek: "ἀριθμὸς τῶν κιόνων ἑκατέρου τοῦ στοίχου πέντε καὶ τριάκοντα,",
    english: "Number of pillars in each row: thirty-five.",
    note: "There are two rows, so seventy supports in the model. This clause specifies their number; it does not by itself prescribe all centre positions along the building.",
    words: [
      {
        form: "ἀριθμὸς",
        lemma: "ἀριθμός",
        meaning: "number / count",
        work: "A count of members is different from a distance between them.",
      },
      {
        form: "στοίχου",
        lemma: "στοῖχος",
        meaning: "of a row",
        work: "Thirty-five belongs to each row, not to the two rows together.",
      },
    ],
  },
  {
    id: "public",
    title: "A passage for the people",
    lines: "12–14",
    pages: [34],
    greek:
      "διαλείπων δ[ί]οδον τῶι δήμωι διὰ μέσ[η]ς τῆς σκευοθήκης. πλάτος τὸ μεταξὺ τῶν κιόνων εἴκοσι ποδῶν,",
    english:
      "Leaving a passage for the people through the middle of the storehouse. Width between the pillars: twenty feet.",
    note: "“For the people” describes the passage in the text. The later storage and visibility arrangements are outside this selected-clause model. It does not simulate historical access, security or actual use. The punctuation follows Choisy; the modern IG transcript punctuates this stretch differently.",
    words: [
      {
        form: "τῶι δήμωι",
        lemma: "δῆμος",
        meaning: "for the people",
        work: "A dative names the passage’s beneficiary.",
      },
      {
        form: "μεταξὺ τῶν κιόνων",
        lemma: "μεταξύ",
        meaning: "between the pillars",
        work: "Twenty feet is clear between the support rows in this width account.",
      },
      {
        form: "σκευοθήκης",
        lemma: "σκευοθήκη",
        meaning: "of the equipment storehouse",
        work: "A place for gear. “Arsenal” here refers to naval stores, rather than a modern weapons factory.",
      },
    ],
  },
  {
    id: "wall",
    title: "Five half-feet in the wall body",
    lines: "26–28",
    pages: [35],
    greek:
      "ἐπὶ δὲ τοῦ ὀρθοστάτου πλινθίσιν οἰκοδομήσει τοὺς τοίχους, μῆκος τετράποσιν, πλάτος πέντε ἡμιποδίων,",
    english:
      "Above the orthostat, build the walls with blocks four feet in length and five half-feet in width.",
    note: "Five half-feet are 2½ feet, not five feet. This is the upper wall body. The text separately gives a wider base and an orthostat another finger thicker. The workshop uses the upper wall width with base pillar breadth as a simplified width account; it does not model the changing profiles.",
    words: [
      {
        form: "ὀρθοστάτου",
        lemma: "ὀρθοστάτης",
        meaning: "of the upright base-course block",
        work: "The clause describes the wall above this course.",
      },
      {
        form: "ἡμιποδίων",
        lemma: "ἡμιπόδιον",
        meaning: "of half-feet",
        work: "Count five units of eight fingers: forty fingers, or 2½ feet.",
      },
    ],
  },
  {
    id: "breadth",
    title: "Two feet and three palms",
    lines: "42–43",
    pages: [36, 37],
    greek: "πάχος τῶν κιόνων κάτωθεν δυοῖν ποδοῖν καὶ τριῶν παλαστῶν,",
    english: "Thickness of the pillars at the bottom: two feet and three palms.",
    note: "The phrase is split across the two original pages. A palm is a quarter of a foot in the retained edition’s units note. The base breadth is therefore 2¾ feet. A square in our drawing is a schematic breadth marker; it does not settle the historical footprint or taper.",
    words: [
      {
        form: "κάτωθεν",
        lemma: "κάτωθεν",
        meaning: "at the bottom / from below",
        work: "This dimension belongs to the base, not necessarily every height of the shaft.",
      },
      {
        form: "δυοῖν ποδοῖν",
        lemma: "δύο; πούς",
        meaning: "of two feet",
        work: "The dual forms fit a pair of feet.",
      },
      {
        form: "παλαστῶν",
        lemma: "παλαστή",
        meaning: "of palms",
        work: "Three palms add twelve fingers: three quarters of a foot.",
      },
    ],
  },
  {
    id: "height",
    title: "The capital is inside the thirty",
    lines: "43",
    pages: [37],
    greek: "μῆκος σὺν τῶι ἐπικράνωι τριάκοντα ποδῶν,",
    english: "Length, including the capital: thirty feet.",
    note: "The source uses μῆκος, “length,” for the pillar’s vertical extent. Translating it as “height” is convenient, but the Greek does not change to ὕψος here. The same inclusive construction used for walls and pillar breadth now controls the capital.",
    words: [
      {
        form: "σὺν τῶι ἐπικράνωι",
        lemma: "σύν + dative; ἐπίκρανον",
        meaning: "including the capital",
        work: "The capital belongs inside the total thirty, not on top of thirty.",
      },
    ],
  },
  {
    id: "exception",
    title: "Seven segments, except the first",
    lines: "43–45",
    pages: [37],
    greek: "σφονδύλων ἕκαστον ἑπτὰ, μῆκος τετραπόδων, τοῦ δὲ πρώτου πεντέποδος.",
    english: "Each [pillar] of seven stack segments, four feet long, but the first five feet long.",
    note: "The shaft has one five-foot segment and six four-foot segments: 29 feet. With a thirty-foot total including the capital, a one-foot capital follows under this additive account. One foot is derived, not a separately stated capital height. “Drum” is a common translation of σφόνδυλος; the schematic blocks here do not impose circularity.",
    words: [
      {
        form: "σφονδύλων",
        lemma: "σφόνδυλος",
        meaning: "of stack segments / drums",
        work: "Seven members belong to one pillar.",
      },
      {
        form: "ἕκαστον",
        lemma: "ἕκαστος",
        meaning: "each",
        work: "Repeat the seven-member construction for each pillar.",
      },
      {
        form: "τοῦ δὲ πρώτου",
        lemma: "πρῶτος; δέ",
        meaning: "but the first",
        work: "The exception changes one segment, not all seven.",
      },
      {
        form: "πεντέποδος",
        lemma: "πεντέπους",
        meaning: "five feet long",
        work: "Use five for the first segment, then six times four.",
      },
    ],
  },
];
export const sourceNotice =
  "Selected Greek newly transcribed from Choisy’s 1884 printed edition, with line wraps and end-of-line hyphens removed, initial capitals lowered and punctuation lightly regularized. Bracketed restored letters remain. Ancient text, Choisy’s French and his reconstruction are distinct from the new English, word notes and modern diagrams. IG II² 1668 line numbers identify the modern reference; the PHI transcript is linked for comparison, not redistributed as our source edition.";
export const modelNotice =
  "This is a constraint exercise using selected clauses, not a complete reconstruction of the arsenal. Width uses the upper wall body and base pillar breadth without modelling taper or changing wall profiles. Length uses 4 plethra = 400 feet. Uniform spacing, symmetric end gaps and square breadth markers are modern choices. Roof, doors, storage, masonry joints, later scholarship, excavated remains and structural capacity are outside the model.";
