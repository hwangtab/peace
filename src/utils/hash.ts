/**
 * Deterministic hash for seeded pseudo-random ordering.
 * Used to shuffle musician lists in a stable way per page.
 */
export const seededHash = (id: number, seed: number): number => {
  let h = (id * 2654435761 + seed * 40503) | 0;
  h = (((h >>> 16) ^ h) * 45679) | 0;
  return ((h >>> 16) ^ h) | 0;
};
