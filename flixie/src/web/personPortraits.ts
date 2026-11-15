// Keep aligned with the shared backend's services/personPortraits.ts policy.
// User-selected Nolan gallery photo 2/15, confirmed 14 November 2026.
const portraits: Readonly<Record<number, string>> = {
  525: "/kWogkBJKzXFJSY8cZpuzanfsaFi.jpg",
};
export const preferredPersonPortrait = (id: number, fallback: string): string => portraits[id] ?? fallback;
