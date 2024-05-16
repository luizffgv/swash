/**
 * Does a compile-time assertion that `_T` extends `true`. This will cause a
 * compilation error if `_T` does not extend `true`.
 */
export function staticAssert<_T extends true>(_message: string): void {}

export default staticAssert;
