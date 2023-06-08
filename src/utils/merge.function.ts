import { isArray, mergeWith } from 'lodash-es';

function reconcileArrays(
  dest: Array<unknown> = [],
  source: Array<unknown>
): Array<unknown> {
  return dest.concat(source);
}

export default function merge<T>(dest: T, ...sources: Array<T>): T {
  return mergeWith(dest, ...sources, (dest: unknown, source: unknown) => {
    if (isArray(dest) && isArray(source)) {
      return reconcileArrays(dest, source);
    }
  });
}
