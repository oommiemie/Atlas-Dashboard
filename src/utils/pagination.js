// Pagination helpers shared across list views.

// Returns up to `size` page numbers (1-indexed) as a sliding window centered
// on the current page, so the active page is always visible even past page 3.
// e.g. pageWindow(5, 8) -> [4, 5, 6]; pageWindow(1, 8) -> [1, 2, 3]; pageWindow(8, 8) -> [6, 7, 8]
export function pageWindow(current, total, size = 3) {
  if (!Number.isFinite(total) || total <= 0) return [];
  const span = Math.min(size, total);
  let start = Math.max(1, current - Math.floor(span / 2));
  const end = Math.min(total, start + span - 1);
  start = Math.max(1, end - span + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
