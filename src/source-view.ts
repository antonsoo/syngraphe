import { studyBlobUrl } from "./assets";
export function sourceViewer(onPage: (page: number) => void) {
  const select = document.querySelector<HTMLSelectElement>("#source-page");
  const image = document.querySelector<HTMLImageElement>("#source-image");
  const status = document.querySelector<HTMLElement>("#source-status");
  const caption = document.querySelector<HTMLElement>("#source-caption");
  const pdf = document.querySelector<HTMLAnchorElement>("#source-pdf");
  const full = document.querySelector<HTMLAnchorElement>("#source-full");
  if (!select || !image || !status || !caption || !pdf || !full)
    throw new Error("Missing source viewer.");
  let revision = 0,
    currentURL = "";
  const show = async (page: number) => {
    const entry = __SOURCE_MANIFEST__.pages.find((p) => p.pdfPage === page);
    if (!entry) throw new Error("Unknown source page.");
    select.value = String(page);
    onPage(page);
    const r = ++revision;
    image.hidden = true;
    full.hidden = true;
    status.textContent = "Checking this page against the source edition…";
    caption.textContent = entry.label;
    pdf.href = `${__SOURCE_MANIFEST__.pdf}#page=${page}`;
    let url = "";
    try {
      url = await studyBlobUrl(`sources/${entry.file}`, "image/jpeg");
      const decoded = new Image();
      decoded.src = url;
      await decoded.decode();
      if (r !== revision) {
        URL.revokeObjectURL(url);
        return;
      }
      if (currentURL) URL.revokeObjectURL(currentURL);
      currentURL = url;
      image.src = url;
      image.alt = `Whole page: ${entry.label}. Choisy, 1884.`;
      image.hidden = false;
      full.href = url;
      full.hidden = false;
      status.textContent = "Verified whole source page for this edition.";
    } catch (e) {
      if (url) URL.revokeObjectURL(url);
      if (r !== revision) return;
      status.textContent =
        e instanceof Error ? e.message : "Could not read this source. Reconnect and retry.";
    }
  };
  select.addEventListener("change", () => void show(Number(select.value)));
  document
    .querySelector("#source-retry")
    ?.addEventListener("click", () => void show(Number(select.value)));
  const frame = document.querySelector<HTMLElement>("#source-frame");
  document.querySelector("#source-enlarge")?.addEventListener("click", (e) => {
    if (!frame) return;
    const large = frame.classList.toggle("enlarged");
    (e.currentTarget as HTMLButtonElement).setAttribute("aria-pressed", String(large));
    (e.currentTarget as HTMLButtonElement).textContent = large
      ? "Fit page to width"
      : "Enlarge page";
    frame.focus();
  });
  window.addEventListener("pagehide", () => {
    if (currentURL) URL.revokeObjectURL(currentURL);
  });
  return show;
}
