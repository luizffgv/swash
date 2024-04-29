import { useEffect, useRef, useState } from "react";
import {
  SwashDragEnterEvent,
  SwashDragLeaveEvent,
  SwashDropEvent,
  ReplyHandler,
} from "#/events";
import { EmptyPayload, Payload } from "#/payload";
import { receiverTag } from "#/tags";
import { DraggableContext } from "#/context/draggable";
import { GhostContext } from "#/context/ghost";

export interface DraggableProperties {
  children: React.ReactNode;
  /** Content to be shown while the draggable is being dragged. */
  ghost?: React.ReactNode | undefined;
  /** Callback for handling event replies created by DND receivers.  */
  onReply?: ReplyHandler | undefined;
  /**
   * Z index to apply to the draggable when it is being dragged. Default is `1`.
   */
  dragZIndex?: number | undefined;
}

export function Draggable(properties: DraggableProperties) {
  const { onReply, dragZIndex = 1 } = properties;

  const container = useRef<HTMLDivElement>(null);

  const [payload, setPayload] = useState<Payload>(new EmptyPayload());

  const [dragging, setDragging] = useState(false);
  /** Offset of the draggable relative to the mouse position. */
  const dragOffset = useRef({ x: 0, y: 0 });
  /** Identifier of the touch object being tracked. */
  const touchID = useRef<number>();
  /** Last hovered receiver element, if any. */
  const hoveredReceiver = useRef<Element | null>();

  // Size of the ghost element. Determined when the draggable starts being
  // dragged.
  const [ghostSize, setGhostSize] = useState({
    width: Number.NaN,
    height: Number.NaN,
  });

  // Reset touchID when the draggable stops being dragged.
  useEffect(() => {
    if (dragging) return;

    touchID.current = undefined;
  }, [dragging]);

  // Fire a DND drag leave event when the state changes to not dragging if there
  // is a receiver that was being hovered.
  useEffect(() => {
    if (dragging || hoveredReceiver.current == null) return;

    hoveredReceiver.current?.dispatchEvent(
      new SwashDragLeaveEvent(payload, onReply)
    );
    hoveredReceiver.current = undefined;
  }, [dragging, onReply, payload]);

  // Logic to execute when the draggable is being dragged.
  useEffect(() => {
    if (!dragging) return;

    const onUp = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();

      if (touchID.current != null) {
        if (event instanceof MouseEvent) {
          return;
        }

        const touch = [...event.changedTouches].find(
          ({ identifier }) => identifier === touchID.current
        );
        if (touch == null) return;
      }

      hoveredReceiver.current?.dispatchEvent(
        new SwashDropEvent(payload, onReply)
      );

      setDragging(false);
    };

    const onMove = (event: MouseEvent | TouchEvent) => {
      const currentContainer = container.current!;

      let eventX: number;
      let eventY: number;
      if (event instanceof TouchEvent) {
        const touch = [...event.changedTouches].find(
          ({ identifier }) => identifier === touchID.current
        );
        if (touch == null) return;
        ({ clientX: eventX, clientY: eventY } = touch);
      } else if (touchID.current == null) {
        ({ clientX: eventX, clientY: eventY } = event);
      } else {
        return;
      }

      const { x: offsetX, y: offsetY } = dragOffset.current;
      currentContainer.style.top = `${eventY + offsetY}px`;
      currentContainer.style.left = `${eventX + offsetX}px`;

      let hovered = document.elementFromPoint(eventX, eventY);
      while (hovered != null && hovered[receiverTag] !== true) {
        hovered = hovered.parentElement;
      }

      if (hoveredReceiver.current !== hovered) {
        hovered?.dispatchEvent(new SwashDragEnterEvent(payload, onReply));

        hoveredReceiver.current?.dispatchEvent(
          new SwashDragLeaveEvent(payload, onReply)
        );
        hoveredReceiver.current = hovered;
      }
    };

    addEventListener("mouseup", onUp);
    addEventListener("touchend", onUp);
    addEventListener("mousemove", onMove);
    addEventListener("touchmove", onMove);

    return () => {
      removeEventListener("mouseup", onUp);
      removeEventListener("touchend", onUp);
      removeEventListener("mousemove", onMove);
      removeEventListener("touchmove", onMove);
    };
  }, [dragging, payload, onReply]);

  // Begins dragging when the draggable is clicked.
  const onDown = (event: React.MouseEvent | React.TouchEvent) => {
    if (dragging) return;
    if ("button" in event && event.button !== 0) return;

    event.preventDefault();

    const currentContainer = container.current!;
    const { top, left, width, height } =
      currentContainer.getBoundingClientRect();
    currentContainer.style.top = `${top}px`;
    currentContainer.style.left = `${left}px`;

    let eventX: number;
    let eventY: number;
    if ("changedTouches" in event) {
      const touch = event.changedTouches[0];
      touchID.current = touch.identifier;
      ({ clientX: eventX, clientY: eventY } = touch);
    } else {
      ({ clientX: eventX, clientY: eventY } = event);
    }

    dragOffset.current = { x: left - eventX, y: top - eventY };

    setGhostSize({ width, height });

    setDragging(true);
  };

  return (
    <DraggableContext.Provider value={{ dragging, setPayload }}>
      {dragging && (
        <GhostContext.Provider value={{ ...ghostSize }}>
          {properties.ghost}
        </GhostContext.Provider>
      )}
      <div
        ref={container}
        onMouseDown={onDown}
        onTouchStart={onDown}
        style={{
          cursor: dragging ? "auto" : "pointer",
          pointerEvents: dragging ? "none" : "auto",
          position: dragging ? "fixed" : "static",
          touchAction: "none",
          zIndex: dragging ? dragZIndex : "auto",
        }}
      >
        {properties.children}
      </div>
    </DraggableContext.Provider>
  );
}

export default Draggable;
