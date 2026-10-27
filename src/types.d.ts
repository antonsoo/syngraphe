interface SourcePage {
  id: string;
  file: string;
  label: string;
  kind: string;
  pdfPage: number;
  bytes: number;
  sha256: string;
}
interface SourceManifest {
  title: string;
  author: string;
  year: number;
  publisher: string;
  copy: string;
  catalogue: string;
  pdf: string;
  pdfBytes: number;
  pdfSha256: string;
  rights: string;
  pages: SourcePage[];
}
declare const __SOURCE_MANIFEST__: SourceManifest;
declare const __SOURCE_FILES__: Record<string, { bytes: number; sha256: string }>;
declare const __EDITION__: string;
