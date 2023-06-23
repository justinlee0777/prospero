/**
 * Returns the elements in the array or tuple without the first element.
 */
type Tail<T extends Array<any>> = T extends [T[0], ...infer R] ? R : never;
