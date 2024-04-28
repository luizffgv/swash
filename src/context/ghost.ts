import { createContext } from "react";

/** Context type used for implementing DND ghosts. */
export interface GhostContext {
  /** Width of the draggable element at the time the drag started. */
  readonly width: number;
  /** Height of the draggable element at the time the drag started. */
  readonly height: number;
}

/** Default value for {@link GhostContext}. */
export const ghostContextDefaultValue: GhostContext = {
  width: Number.NaN,
  height: Number.NaN,
};

/** Context used for implementing DND ghosts. */
export const GhostContext = createContext(ghostContextDefaultValue);
