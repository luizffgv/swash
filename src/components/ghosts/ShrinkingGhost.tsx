import { useContext, useEffect, useState } from "react";
import { DraggableContext } from "#/context/draggable";
import { GhostContext } from "#/context/ghost";

/** Properties for the {@link ShrinkingGhost} component. */
export interface ShrinkingGhostProperties {
  /** Duration of the shrinking animation in milliseconds. */
  duration: number;
}

/**
 * An invisible ghost that transitions from the draggable size to 0x0 pixels.
 * @param properties - Properties of the component.
 */
export function ShrinkingGhost(properties: ShrinkingGhostProperties) {
  const { duration } = properties;

  const { width, height } = useContext(GhostContext);

  const {
    states: { dragging },
  } = useContext(DraggableContext);

  const [shrinked, setShrinked] = useState(false);

  useEffect(() => {
    if (dragging) {
      let handle: number | undefined = requestAnimationFrame(() => {
        handle = undefined;
        setShrinked(true);
      });

      return () => {
        if (handle != null) {
          cancelAnimationFrame(handle);
        }
        setShrinked(false);
      };
    }
  }, [dragging]);

  return (
    <div
      style={{
        width: shrinked ? 0 : `${width}px`,
        height: shrinked ? 0 : `${height}px`,
        transition: `all ${duration}ms`,
      }}
    ></div>
  );
}
