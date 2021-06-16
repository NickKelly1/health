/**
 * Add a method to the object
 *
 * Assert that this method is not overriding any other methods
 */
export function noOverride<T extends {}, K extends keyof T>(
  obj: T,
  key: K,
  method: T[K],
  descriptor?: Omit<TypedPropertyDescriptor<any>, 'get' | 'set' | 'value'>
) {
  if (key in obj) {
    const name = obj?.toString() ?? Object.getPrototypeOf(obj)?.constructor?.name ?? 'Unknown Object';
    throw new ReferenceError(`Failed asserting that ${String(key)} does not exist in ${name}`);
  }
  Object.defineProperty(obj, key, {
    ...descriptor,
    value: method,
  })
}