import { useCallback, useRef, useState } from "react";

export const useCopyElementText = () => {
  const elementRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [clicked, setClicked] = useState(false);

  const handleCopyClick = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!elementRef.current) {
      return;
    }

    navigator.clipboard?.writeText?.(elementRef.current.innerText);
    setClicked(true);
    timeoutRef.current = setTimeout(() => setClicked(false), 1000);
  }, []);

  return { ref: elementRef, onClick: handleCopyClick, pending: clicked };
};
