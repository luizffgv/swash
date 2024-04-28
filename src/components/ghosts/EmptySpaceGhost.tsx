import { useContext } from "react";
import { GhostContext } from "#/context/ghost";

/**
 * An invisible ghost that fills the space previously occupied by the draggable.
 */
export function EmptySpaceGhost() {
  const { width, height } = useContext(GhostContext);

  return <div style={{ width, height }}></div>;
}
