import { useEffect, useRef } from "react";

/**
 * Automatically resizes a textarea to fit its content up to a maximum height.
 * Switches to scrollable mode once the content exceeds maxHeight.
 *
 * @param value   The controlled value of the textarea (triggers resize on change).
 * @param maxHeight  Maximum pixel height before overflow scrolling kicks in.
 * @returns A ref to attach to the <textarea> element.
 */
export function useAutoResizeTextarea(value: string, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset first so scrollHeight reflects the true content height
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [value, maxHeight]);

  return textareaRef;
}
