import { useCallback, useRef, useState } from "react";

export const useCopyElementText = (content?: string) => {
  const elementRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [clicked, setClicked] = useState(false);

  const handleCopyClick = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!elementRef.current) {
      if (content) {
        navigator.clipboard?.writeText?.(content);
        setClicked(true);
        timeoutRef.current = setTimeout(() => setClicked(false), 1000);
      }

      return;
    }

    navigator.clipboard?.writeText?.(elementRef.current.innerText);
    setClicked(true);
    timeoutRef.current = setTimeout(() => setClicked(false), 1000);
  }, [content]);

  return { ref: elementRef, onClick: handleCopyClick, pending: clicked };
};
