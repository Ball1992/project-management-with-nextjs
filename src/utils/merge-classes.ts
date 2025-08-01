// Utility function to merge classes that works with different versions of minimal-shared
export function mergeClasses(classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
