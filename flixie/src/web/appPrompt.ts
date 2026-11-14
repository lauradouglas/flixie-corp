import {sharedMediaStore} from "../mediaShare";
export function mobilePromptDevice(
  userAgent: string,
  platform: string,
  touchPoints: number,
  width: number,
): "ios" | "android" | null {
  const selected = sharedMediaStore(userAgent, platform, touchPoints);
  if (!selected || width > 820) return null;
  if (
    selected === "ios" &&
    /Safari/.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS/.test(userAgent)
  )
    return null;
  return selected;
}
