export const mobileTaskQuery = "(max-width: 680px), (max-width: 1023px) and (max-height: 500px) and (pointer: coarse)";

/** Follow the visible phone viewport when the keyboard changes its usable area.
 * Keep native pinch zoom/panning: a zoomed viewport must not resize the task.
 */
export function followMobileTaskViewport(dialog: HTMLDialogElement, browser: Window = window) {
  const media = browser.matchMedia(mobileTaskQuery);
  const viewport = browser.visualViewport;
  const clear = () => {
    dialog.style.removeProperty("--fx-task-height");
    dialog.style.removeProperty("--fx-task-top");
  };
  const update = () => {
    if (!media.matches || !viewport || viewport.scale !== 1) { clear(); return; }
    dialog.style.setProperty("--fx-task-height", `${viewport.height}px`);
    dialog.style.setProperty("--fx-task-top", `${viewport.offsetTop}px`);
  };
  update();
  media.addEventListener("change", update);
  viewport?.addEventListener("resize", update);
  viewport?.addEventListener("scroll", update);
  return () => {
    media.removeEventListener("change", update);
    viewport?.removeEventListener("resize", update);
    viewport?.removeEventListener("scroll", update);
    clear();
  };
}
