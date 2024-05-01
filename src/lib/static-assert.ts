/**
 * Does a compile-time assertion that `T` extends `true`. This will cause a
 * compilation error if `T` does not extend `true`.
 */
export function staticAssert<T extends true>(message: string): void {}

export default staticAssert;
