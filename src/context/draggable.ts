import { DraggableStateMap } from "#/lib/draggable-state";
import { Payload } from "#/payload";
import { createContext } from "react";

/** Context type for {@link DraggableContext}. */
export interface DraggableContextType {
  /**
   * {@link DraggableStateMap} representing the current state of the the
   * draggable.
   */
  readonly states: DraggableStateMap;

  /**
   * The last position of the draggable while it was being dragged.
   * The value is not guaranteed to be correct before the first drag.
   */
  readonly lastDragPosition: Readonly<{ x: number; y: number }>;

  /**
   * Sets the promise to wait for before transitioning the draggable state from
   * `returning` to `idle`.
   *
   * The promise should ideally be set during the `dragging` state, to avoid
   * being reset by `idle` and being set after `returning` has already begun
   * transitioning to `idle`.
   *
   * The provided promise is thrown away when the draggable goes back to the
   * `idle` state. It must be provided again.
   *
   * A use case for this is components that implement custom draggable return
   * animations.
   * @param promise - Promise to wait for.
   */
  setReturnedPromise: (promise: Promise<void>) => void;

  /**
   * Sets the payload to be sent to the DND receiver when the user drops the
   * draggable.
   * @param payload - Payload to be dropped.
   */
  setPayload: (payload: Payload) => void;
}

/** Default value for {@link DraggableContext}. */
export const draggableContextDefaultValue: DraggableContextType = {
  states: { idle: true, dragging: false, returning: false },
  lastDragPosition: { x: 0, y: 0 },
  setReturnedPromise: () => {
    console.warn("Called setReturnedPromise on the default DraggableContext.");
  },
  setPayload: () => {
    console.warn("Called setPayload on the default DraggableContext.");
  },
};

/** Context used to set a payload for a draggable component. */
export const DraggableContext = createContext<DraggableContextType>(
  draggableContextDefaultValue
);
