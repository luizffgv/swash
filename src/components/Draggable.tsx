import { EmptyPayload, Payload } from "#/payload";
import {
  ReplyHandler,
  SwashDragEnterEvent,
  SwashDragLeaveEvent,
  SwashDropEvent,
} from "#/events";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "#/lib/dimensions";
import { DraggableContext } from "#/context/draggable";
import { DraggableState } from "#/lib/draggable-state";
import { GhostContext } from "#/context/ghost";
import { IdleDraggableSizeContext } from "#/context/idle-draggable-size";
import { InnerDraggable } from "./InnerDraggable";
import { receiverTag } from "#/tags";

export interface DraggableProperties {
  children: React.ReactNode;
  /** Content to be shown while the draggable is being dragged. */
  ghost?: React.ReactNode | undefined;
  /** Callback for handling event replies created by DND receivers.  */
  onReply?: ReplyHandler | undefined;
  /**
   * Z index to apply to the draggable when it is not idle (i.e. it is being
   * dragged or returning).
   *
   * Default is `1`.
   */
  activeZIndex?: number | undefined;
}

export function Draggable(properties: DraggableProperties) {
  const { onReply, activeZIndex: dragZIndex = 1 } = properties;

  const container = useRef<HTMLDivElement>(null);

  const [payload, setPayload] = useState<Payload>(new EmptyPayload());

  const [state, setState] = useState<DraggableState>("idle");
  let states;
  switch (state) {
    case "idle": {
      states = { idle: true, dragging: false, returning: false } as const;
      break;
    }
    case "dragging": {
      states = { idle: false, dragging: true, returning: false } as const;
      break;
    }
    case "returning": {
      states = { idle: false, dragging: false, returning: true } as const;
      break;
    }
  }
  const { idle, dragging, returning } = states;

  /** Offset of the draggable relative to the mouse position. */
  const dragOffset = useRef({ x: 0, y: 0 });
  /** Identifier of the touch object being tracked. */
  const touchID = useRef<number>();
  /** Last hovered receiver element, if any. */
  const hoveredReceiver = useRef<Element | null>();
  /** Last position of the draggable while it was being dragged. */
  const lastDragPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  /** Promise awaited before transitioning from `returning` to `idle`. */
  const returnedPromise = useRef<Promise<void>>();

  // Size of the ghost element. Determined when the draggable starts being
  // dragged.
  const [ghostSize, setGhostSize] = useState<Dimensions>({
    width: Number.NaN,
    height: Number.NaN,
  });

  // Reset touchID when the draggable stops being dragged.
  useEffect(() => {
    if (state !== "dragging") {
      touchID.current = undefined;
    }
  }, [state]);

  // Reset returnedPromise when the draggable becomes idle.
  useEffect(() => {
    if (state === "idle") {
      returnedPromise.current = undefined;
    }
  }, [state]);

  // Fire a DND drag leave event when the state changes to not dragging if there
  // is a receiver that was being hovered.
  useEffect(() => {
    if (!idle || hoveredReceiver.current == null) {
      return;
    }

    hoveredReceiver.current?.dispatchEvent(
      new SwashDragLeaveEvent(payload, onReply)
    );
    hoveredReceiver.current = undefined;
  }, [state, onReply, payload]);

  // Logic to execute when the draggable is being dragged.
  useEffect(() => {
    if (!dragging) {
      return;
    }

    const onUp = (event: MouseEvent | TouchEvent) => {
      if ("button" in event && event.button !== 0) {
        return;
      }

      event.preventDefault();

      if (touchID.current != null) {
        if (event instanceof MouseEvent) {
          return;
        }

        const touch = [...event.changedTouches].find(
          ({ identifier }) => identifier === touchID.current
        );
        if (touch == null) {
          return;
        }
      }

      hoveredReceiver.current?.dispatchEvent(
        new SwashDropEvent(payload, onReply)
      );

      setState("returning");
    };

    const onMove = (event: MouseEvent | TouchEvent) => {
      const currentContainer = container.current!;

      let eventX: number;
      let eventY: number;
      // TouchEvent isn't defined for Firefox desktop
      if ("TouchEvent" in window && event instanceof TouchEvent) {
        const touch = [...event.changedTouches].find(
          ({ identifier }) => identifier === touchID.current
        );
        if (touch == null) {
          return;
        }
        ({ clientX: eventX, clientY: eventY } = touch);
      } else if (event instanceof MouseEvent && touchID.current == null) {
        ({ clientX: eventX, clientY: eventY } = event);
      } else {
        return;
      }

      const { x: offsetX, y: offsetY } = dragOffset.current;
      const draggableX = eventX + offsetX;
      const draggableY = eventY + offsetY;

      lastDragPosition.current.x = draggableX;
      lastDragPosition.current.y = draggableY;

      currentContainer.style.top = `${draggableY}px`;
      currentContainer.style.left = `${draggableX}px`;

      const hovered = document
        .elementsFromPoint(eventX, eventY)
        .find((element) => element[receiverTag] === true);

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
    addEventListener("touchcancel", onUp);
    addEventListener("mousemove", onMove);
    addEventListener("touchmove", onMove);

    return () => {
      removeEventListener("mouseup", onUp);
      removeEventListener("touchend", onUp);
      removeEventListener("touchcancel", onUp);
      removeEventListener("mousemove", onMove);
      removeEventListener("touchmove", onMove);
    };
  }, [state, payload, onReply]);

  // Wait for the draggable to be returned before idling.
  useEffect(() => {
    if (!returning) {
      return;
    }

    if (returnedPromise.current == null) {
      setState("idle");
      return;
    }

    /**
     * Used to ignore the promise resolution if something else changed the
     * state. This avoids the state being set to idle after it was set to
     * something else.
     */
    let ignore = false;
    void returnedPromise.current.then(() => {
      if (!ignore) {
        setState("idle");
      }
    });

    return () => {
      ignore = true;
    };
  }, [state]);

  useEffect(() => {
    if (!idle) {
      return;
    }

    // Begins dragging when the draggable is clicked.
    const onDown = (event: MouseEvent | TouchEvent) => {
      if ("button" in event && event.button !== 0) {
        return;
      }
      if (!event.cancelable) {
        return;
      }

      event.preventDefault();

      const currentContainer = container.current!;
      const { top, left } = currentContainer.getBoundingClientRect();
      currentContainer.style.top = `${top}px`;
      currentContainer.style.left = `${left}px`;

      lastDragPosition.current.x = left;
      lastDragPosition.current.y = top;

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

      setState("dragging");
    };

    const currentContainer = container.current!;

    currentContainer.addEventListener("mousedown", onDown);
    currentContainer.addEventListener("touchstart", onDown);

    return () => {
      currentContainer.removeEventListener("mousedown", onDown);
      currentContainer.removeEventListener("touchstart", onDown);
    };
  }, [state]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateAreas: "stack",
      }}
    >
      <DraggableContext.Provider
        value={{
          states,
          setPayload,
          setReturnedPromise: useCallback((promise) => {
            returnedPromise.current = promise;
          }, []),
          lastDragPosition: lastDragPosition.current,
        }}
      >
        <div style={{ gridArea: "stack" }}>
          <GhostContext.Provider value={{ ...ghostSize }}>
            {state !== "idle" && properties.ghost}
          </GhostContext.Provider>
        </div>
        <IdleDraggableSizeContext.Provider
          value={{
            propagateDimensions: (dimensions) =>
              setGhostSize(
                dimensions ?? { width: Number.NaN, height: Number.NaN }
              ),
            leaveProxyMode: () => {
              // This is a no-op since the Draggable root is always in a proxy
              // mode.
            },
          }}
        >
          <div
            ref={container}
            style={{
              cursor: dragging ? "grab" : "pointer",
              gridArea: "stack",
              position: dragging ? "fixed" : "static",
              touchAction: "none",
              zIndex: idle ? "auto" : dragZIndex,
            }}
          >
            <InnerDraggable>{properties.children}</InnerDraggable>
          </div>
        </IdleDraggableSizeContext.Provider>
      </DraggableContext.Provider>
    </div>
  );
}

export default Draggable;
