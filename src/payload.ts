/** A Payload that can be sent using drag and drop interactions. */
export abstract class Payload<T = unknown> {
  /** Value of the payload. */
  value: T;

  /**
   * Constructs the payload with the given value.
   * @param value - Value of the payload.
   */
  constructor(...value: T extends undefined ? [] | [T] : [T]) {
    this.value = value[0] as T;
  }
}

/** A payload with no value. */
export class EmptyPayload extends Payload<undefined> {}

export default Payload;
