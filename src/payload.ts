/** A Payload that can be sent using drag and drop interactions. */
export abstract class Payload<T = unknown> {
  /** Value of the payload. */
  value: T;

  /**
   * Constructs the payload with the given value.
   * @param value - Value of the payload.
   */
  constructor(value: T) {
    this.value = value;
  }
}

/** A payload with no value. */
export class EmptyPayload extends Payload<undefined> {
  constructor() {
    super(undefined);
  }
}

export default Payload;
