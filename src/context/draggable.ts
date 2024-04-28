import { createContext } from "react";
import { Payload } from "#/payload";

/** Context type for {@link DraggableContext}. */
export interface DraggableContextType {
  /** Whether the draggable is currently being dragged. */
  readonly dragging: boolean;

  /**
   * Sets the payload to be sent to the DND receiver when the user drops the
   * draggable.
   * @param payload - Payload to be dropped.
   */
  setPayload(payload: Payload): void;
}

/** Default value for {@link DraggableContext}. */
export const draggableContextDefaultValue: DraggableContextType = {
  dragging: false,
  setPayload: () => {
    console.warn("Called setPayload on the default DraggableContext.");
  },
};

/** Context used to set a payload for a draggable component. */
export const DraggableContext = createContext<DraggableContextType>(
  draggableContextDefaultValue
);
