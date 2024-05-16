import {
  SwashDragEnterEvent,
  SwashDragLeaveEvent,
  SwashDropEvent,
} from "#/events";
import { useEffect, useRef } from "react";
import { receiverTag } from "#/tags";
import { throwIfNull } from "ekranoplan/types/conversions";

export interface DragReceiverProperties {
  /** Callback for handling the {@link SwashDragEnterEvent} event. */
  onSwashDragEnter?: ((event: SwashDragEnterEvent) => void) | undefined;
  /** Callback for handling the {@link SwashDragLeaveEvent} event. */
  onSwashDragLeave?: ((event: SwashDragLeaveEvent) => void) | undefined;
  /** Callback for handling the {@link SwashDropEvent} event. */
  onSwashDrop?: ((event: SwashDropEvent) => void) | undefined;
  children?: React.ReactNode | undefined;
}

/**
 * A component that produces DND events.
 * @param properties - Properties of the component.
 */
export function DragReceiver(properties: DragReceiverProperties) {
  const {
    children,
    onSwashDragEnter = () => {},
    onSwashDragLeave = () => {},
    onSwashDrop = () => {},
  } = properties;

  const container = useRef<HTMLDivElement>(null);

  // Set the container as a DND receiver
  useEffect(() => {
    const currentContainer = throwIfNull(container.current);

    currentContainer[receiverTag] = true;
  }, []);

  // Setup listeners
  useEffect(() => {
    const currentContainer = throwIfNull(container.current);

    currentContainer.addEventListener("swash-drag-enter", onSwashDragEnter);
    currentContainer.addEventListener("swash-drag-leave", onSwashDragLeave);
    currentContainer.addEventListener("swash-drop", onSwashDrop);

    return () => {
      currentContainer.removeEventListener(
        "swash-drag-enter",
        onSwashDragEnter
      );
      currentContainer.removeEventListener(
        "swash-drag-leave",
        onSwashDragLeave
      );
      currentContainer.removeEventListener("swash-drop", onSwashDrop);
    };
  }, [onSwashDragEnter, onSwashDragLeave, onSwashDrop]);

  return <div ref={container}>{children}</div>;
}

export default DragReceiver;
