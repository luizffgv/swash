/** Symbol used to identify a receiver, when present in an HTML element. */
export const receiverTag = Symbol("dnd-receiver");

/** Type of {@link receiverTag}. */
export type ReceiverTag = typeof receiverTag;

declare global {
  interface Element {
    [receiverTag]?: boolean | undefined;
  }
}
