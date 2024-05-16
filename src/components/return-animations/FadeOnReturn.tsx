import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DraggableContext } from "#/context/draggable";
import { InnerDraggable } from "#/components/InnerDraggable";

/** Steps of the fade animation. */
type FadeStep = "none" | "hiding" | "appearing";

export interface FadeOnReturnProperties {
  children?: Readonly<React.ReactNode> | undefined;
}

/**
 * When added to a draggable, this component will add a return animation that
 * fades the draggable out on release, then fades it back in at its idle
 * position.
 */
export function FadeOnReturn(properties: Readonly<FadeOnReturnProperties>) {
  const { children } = properties;

  const container = useRef<HTMLDivElement>(null);

  const returnedPromiseResolve = useRef<() => void>();

  const [step, setStep] = useState<FadeStep>("none");

  const {
    states: { dragging, returning },
    lastDragPosition,
    setReturnedPromise,
  } = useContext(DraggableContext);

  useLayoutEffect(() => {
    setStep(returning ? "hiding" : "none");
  }, [returning]);

  useEffect(() => {
    if (dragging) {
      const returnedPromise = new Promise<void>((resolve) => {
        returnedPromiseResolve.current = resolve;
      });

      setReturnedPromise(returnedPromise);
    }
  }, [dragging]);

  useEffect(() => {
    if (step === "none") {
      return;
    }

    const animation = new Animation(
      new KeyframeEffect(
        container.current,
        {
          opacity: [1, 0],
        },
        {
          duration: 250,
          fill: "both",
        }
      )
    );
    animation.addEventListener("finish", () => {
      if (step === "hiding") {
        setStep("appearing");
      } else {
        returnedPromiseResolve.current!();
      }
    });
    if (step === "hiding") {
      animation.play();
    } else {
      animation.reverse();
    }
  }, [step]);

  return (
    <div
      ref={container}
      style={{
        position: step === "hiding" ? "fixed" : "static",
        top: step === "hiding" ? lastDragPosition.y : 0,
        left: step === "hiding" ? lastDragPosition.x : 0,
      }}
    >
      <InnerDraggable>{children}</InnerDraggable>
    </div>
  );
}

export default FadeOnReturn;
