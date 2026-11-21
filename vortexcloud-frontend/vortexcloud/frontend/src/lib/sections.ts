// Smooth-scroll helper for landing-page anchors.
export function scrollToSection(hash: string): void {
  const el = document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
