/**
 * Contains associations between drag and drop payload types and their values.
 * This should be extended to support new payload types.
 */
export interface PayloadTypeMap {
  empty: undefined;
}

/** A Payload that can be sent using drag and drop interactions. */
export type Payload = {
  [K in keyof PayloadTypeMap]: {
    type: K;
    value: PayloadTypeMap[K];
  };
}[keyof PayloadTypeMap];
