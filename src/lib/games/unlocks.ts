/** Future hook: $5 unlock may gate game extras. Base play always free. */
export function canAccessGameFeature(_featureId: string): boolean {
  return true;
}
