import staticAssert from "./static-assert";

/**
 * The current state of a draggable.
 * - `idle`: The draggable is resting at its original position.
 * - `dragging`: The draggable is currently being dragged.
 * - `returning`: The draggable was released but is not yet idle, e.g. it is
 * doing a return animation.
 */
export type DraggableState = "idle" | "dragging" | "returning";

/**
 * Maps {@link DraggableState | draggable states} to either `true` or `false`
 * based on the current state of a draggable.
 */
export type DraggableStateMap =
  | {
      idle: true;
      returning: false;
      dragging: false;
    }
  | {
      idle: false;
      returning: true;
      dragging: false;
    }
  | {
      idle: false;
      returning: false;
      dragging: true;
    };

staticAssert<
  DraggableStateMap extends { [state in DraggableState]: boolean }
    ? true
    : false
>("DraggableStateMap properties don't match DraggableState");
