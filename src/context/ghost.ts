import { createContext } from "react";

/** Context type used for implementing DND ghosts. */
export interface GhostContext {
  /** Current width of the draggable element. */
  readonly width: number;
  /** Current height of the draggable element. */
  readonly height: number;
}

/** Default value for {@link GhostContext}. */
export const ghostContextDefaultValue: GhostContext = {
  width: Number.NaN,
  height: Number.NaN,
};

/** Context used for implementing DND ghosts. */
export const GhostContext = createContext(ghostContextDefaultValue);
