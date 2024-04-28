import { Payload } from "./payload";

/**
 * Function called when a DND event handler decides to reply to its originator
 * draggable.
 */
export type ReplyHandler = (payload: Payload) => void;

/**
 * An event that can be replied to, sending a payload to the draggable that
 * triggered it.
 */
export class SwashReplyableEvent extends Event {
  /** Handler that receives the reply. Must be set for {@link reply} to work. */
  protected onReply?: ReplyHandler | undefined;

  /**
   * Constructs a new {@link SwashReplyableEvent}.
   * @param arguments_ - Same as {@link Event | event's} constructor parameters.
   */
  constructor(...arguments_: ConstructorParameters<typeof Event>) {
    super(...arguments_);
  }

  /**
   * Sends a payload to the draggable that triggered the event.
   * @param payload - Payload to send.
   */
  reply(payload: Payload) {
    this.onReply?.(payload);
  }
}

/**
 * An even that is fired when something that is being dragged using DND enters a
 * receiver.
 */
export class SwashDragEnterEvent extends SwashReplyableEvent {
  /** Payload containing the data that is being dragged. */
  payload: Payload;

  /**
   * Constructs a new {@link DNDDragEvent}.
   * @param payload - Payload to be dropped.
   * @param onReply - Handler that receives the reply payload.
   */
  constructor(payload: Payload, onReply?: ReplyHandler) {
    super("swash-drag-enter", { bubbles: false });

    this.payload = payload;
    this.onReply = onReply;
  }
}

/**
 * An even that is fired when something that is being dragged using DND leaves a
 * receiver.
 */
export class SwashDragLeaveEvent extends SwashReplyableEvent {
  /** Payload containing the data that is being dragged. */
  payload: Payload;

  /**
   * Constructs a new {@link DNDDragEvent}.
   * @param payload - Payload to be dropped.
   * @param onReply - Handler that receives the reply payload.
   */
  constructor(payload: Payload, onReply?: ReplyHandler) {
    super("swash-drag-leave", { bubbles: false });

    this.payload = payload;
    this.onReply = onReply;
  }
}

/** An even that is fired when something is dropped using DND. */
export class SwashDropEvent extends SwashReplyableEvent {
  /** Payload containing the data that was dropped. */
  payload: Payload;

  /**
   * Constructs a new {@link SwashDropEvent}.
   * @param payload - Payload to be dropped.
   * @param onReply - Handler that receives the reply payload.
   */
  constructor(payload: Payload, onReply?: ReplyHandler) {
    super("swash-drop", { bubbles: false });

    this.payload = payload;
    this.onReply = onReply;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    "swash-drag-enter": SwashDragEnterEvent;
    "swash-drag-leave": SwashDragEnterEvent;
    "swash-drop": SwashDropEvent;
  }
}
