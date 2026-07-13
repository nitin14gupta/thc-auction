/** Best-effort colorway guess from a product name like Nike Dunk Low 'Panda' — the
 * dataset has no structured colorway field, so this is a starting suggestion the
 * seller can still edit, not an authoritative value. */
export function guessColorwayFromName(name: string): string {
  const match = name.match(/['"]([^'"]+)['"]\s*$/);
  return match ? match[1].trim() : "";
}
