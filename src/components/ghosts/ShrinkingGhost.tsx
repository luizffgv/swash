import { useContext, useEffect, useState } from "react";
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

  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  return (
    <div
      style={{
        width: rendered ? 0 : `${width}px`,
        height: rendered ? 0 : `${height}px`,
        transition: `all ${duration}ms`,
      }}
    ></div>
  );
}
