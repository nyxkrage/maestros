import { allSlides } from "contentlayer/generated";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useKeyPress } from "../../hooks";
import { usePresentationCtx } from "./usePresentationContext";
import { useSelectedLayoutSegments } from "next/navigation";

interface SlideHandlerParams {
  currentSlide: number;
  deck: string;
}

export const useNextSlideKeyPress = ({
  currentSlide,
  deck,
}: SlideHandlerParams): void => {
  const { childWindow } = usePresentationCtx();
  const { push } = useRouter();

  useKeyPress(() => {
    const nextSlide = Math.min(
      currentSlide + 1,
      allSlides.filter((slide) => slide.deck === deck).length
    );

    if (nextSlide === currentSlide) return;

    childWindow?.postMessage({
      source: "slide-controller",
      payload: { newSlide: nextSlide },
    });

    return push(`/talks/${deck}/${nextSlide}`);
  }, ["ArrowRight"]);
};

export const usePrevSlideKeyPress = ({
  currentSlide,
  deck,
}: SlideHandlerParams) => {
  const { childWindow } = usePresentationCtx();
  const { push } = useRouter();

  useKeyPress(() => {
    const prevSlide = Math.max(currentSlide - 1, 1);

    if (prevSlide === currentSlide) return;

    childWindow?.postMessage({
      source: "slide-controller",
      payload: { newSlide: prevSlide },
    });

    return push(`/talks/${deck}/${Math.max(currentSlide - 1, 1)}`);
  }, ["ArrowLeft"]);
};

/** Listen to the messages from the slide controller window. */
export const useDeckListener = (deck: string) => {
  const { push } = useRouter();

  useEffect(() => {
    const handleMessage = (message: {
      data: {
        source: string;
        payload: { newSlide: string };
      };
    }) => {
      if (message.data.source === "slide-controller") {
        push(`/talks/${deck}/${message.data.payload.newSlide}`);
      }
    };

    if (typeof window === "undefined") return;
    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [push, deck]);
};
