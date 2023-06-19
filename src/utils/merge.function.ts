/**
 * This will mutate 'dest'.
 */
export default function merge<T extends Object>(dest: T, source: T): T {
  for (const key in source) {
    const destValue = dest[key];
    const sourceValue = source[key];

    if (Array.isArray(destValue) && Array.isArray(sourceValue)) {
      // If both values are arrays, combine both values together.
      dest[key] = (dest[key] as any).concat(source[key]);
    } else if (
      typeof destValue === 'object' &&
      typeof sourceValue === 'object'
    ) {
      // If both values are objects, recursively merge them (dig into object tree until primitives are encountered).
      dest[key] = merge(destValue, sourceValue);
    } else if (sourceValue) {
      // If the source value is defined, always override dest.
      dest[key] = source[key];
    }
    // Do nothing if the source is not defined but the dest is.
  }

  return dest;
}
