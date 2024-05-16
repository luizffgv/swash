/*
**This comment is not normative**, it is a part of the Obsidian notes taken
while implementing.

## Implementation with InnerDraggable

An `InnerDraggable` wraps around a section of a component, measures itself
via `ResizeObserver` and propagates the measurement up until it reaches a
`Draggable`.

We call this "propagation" because `InnerDraggable` may be nested, in this
case the bottommost measurement will override the other measurements.

For the measurements to propagate up in a single render, `InnerDraggable`
propagates down a setter provided by the `Draggable`. This happens in a
single render via context.

### Overriding

Since we want the bottommost `InnerDraggable` to override other
`InnerDraggable`s, we can't simply rely on React's effect order, since higher
effects will run later than deeper effects.

Since deeper effects run first, the bottommost  `InnerDraggable` should have
an effect that sets a flag so the parent `InnerDraggable` goes into **proxy
mode**, disabling its self measurement reporting before it can happen. This
flag propagates up so all intermediary `InnerDraggable`s are in proxy mode.

A proxy `InnerDraggable` must leave proxy mode once it becomes bottommost.
For this to happen, `InnerDraggable` should, during an effect cleanup, call a
function provided by the parent `InnerDraggable` to tell it that it can leave
proxy mode. */

import { useContext, useLayoutEffect, useRef } from "react";
import { Dimensions } from "#/lib/dimensions";
import { IdleDraggableSizeContext } from "#/context/idle-draggable-size";

export interface InnerDraggableProperties {
  children: React.ReactNode;
}

/**
 * This component will contain children and propagate its size to the closest
 * `Draggable` above in the tree.
 *
 * When a `Draggable` has multiple `InnerDraggable` and they aren't one isn't
 * nested inside the others, **the behavior is undefined**.
 *
 * In a `InnerDraggable` hierarchy the bottommost one has priority.
 *
 * This allows components that modify draggable behavior (e.g. by scaling it to
 * 2x while dragging, or making it absolute-positioned while returning) to be
 * ignored when calculating the idle draggable size. Such components may even
 * be nested as the bottommost `InnerDraggable` has priority.
 */
export function InnerDraggable(properties: InnerDraggableProperties) {
  const { children } = properties;

  const { propagateDimensions, leaveProxyMode: stopPropagating } = useContext(
    IdleDraggableSizeContext
  );

  // Whether the inner draggable is forwarding measurements of the child inner
  // draggable instead of propagating its own measurements.
  const proxyMode = useRef(false);

  const selfDimensions = useRef<Dimensions>();

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];

      selfDimensions.current = { width, height };

      if (!proxyMode.current) {
        propagateDimensions(selfDimensions.current);
      }
    });
    observer.observe(containerRef.current!);

    return () => {
      observer.disconnect();
      stopPropagating();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "fit-content", height: "fit-content" }}
    >
      <IdleDraggableSizeContext.Provider
        value={{
          propagateDimensions: (dimensions) => {
            proxyMode.current = true;
            propagateDimensions(dimensions);
          },
          leaveProxyMode: () => {
            proxyMode.current = false;
            propagateDimensions(selfDimensions.current);
          },
        }}
      >
        {children}
      </IdleDraggableSizeContext.Provider>
    </div>
  );
}
