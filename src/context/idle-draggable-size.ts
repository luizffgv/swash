import { Dimensions } from "#/lib/dimensions";
import { createContext } from "react";

/**
 * Context type for approximately telling a `Draggable` the size it has when
 * idle.
 *
 * This is useful so ghosts can shrink and grow as a draggable resizes while
 * being dragged.
 */
export interface _IdleDraggableSizeContext {
  /**
   * Informs the provider of the idle draggable size. This will be propagated
   * upwards until it reaches the `Draggable`.
   * @param dimensions - Dimensions of the draggable.
   */
  propagateDimensions: (dimensions?: Dimensions | undefined) => void;

  /**
   * Signals to the context provider that this node is no longer propagating its
   * size, so the provider will start propagating instead.
   *
   * Should be called whenever the component that is calling
   * {@link propagateDimensions} is about to stop.
   */
  leaveProxyMode(): void;
}

/** Default value for {@link IdleDraggableSizeContext}. */
export const IdleDraggableSizeContextDefaultValue: _IdleDraggableSizeContext = {
  propagateDimensions: () => {
    console.warn(
      "Called setDimensions on the default IdleDraggableSizeContext."
    );
  },
  leaveProxyMode: () => {
    console.warn(
      "Called stopPropagating on the default IdleDraggableSizeContext."
    );
  },
};

/** Context for approximately telling a `Draggable` the size it is when idle. */
export const IdleDraggableSizeContext = createContext(
  IdleDraggableSizeContextDefaultValue
);
