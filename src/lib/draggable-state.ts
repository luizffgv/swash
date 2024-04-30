/**
 * The current state of a draggable.
 * - `idle`: The draggable is resting at its original position.
 * - `dragging`: The draggable is currently being dragged.
 * - `returning`: The draggable was released but is not yet idle, e.g. it is
 * doing a return animation.
 */
export type DraggableState = "idle" | "dragging" | "returning";
