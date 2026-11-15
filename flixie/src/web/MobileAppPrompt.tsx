import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {mobilePromptDevice} from "./appPrompt";
import "./mobile-app-prompt.css";
import { site } from "../site";
export default function MobileAppPrompt() {
  const dismissed = useRef(false), prompt = useRef<HTMLElement>(null);
  const [device, setDevice] = useState<"ios" | "android" | null>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const preview = import.meta.env.DEV && window.innerWidth <= 820 ? document.documentElement.dataset.flixieQaAppPrompt : undefined;
    const selected = preview === "ios" || preview === "android" ? preview : mobilePromptDevice(
      navigator.userAgent,
      navigator.platform,
      navigator.maxTouchPoints,
      window.innerWidth,
    );
    if (!selected) return;
    try {
      if (sessionStorage.getItem("flixie-app-prompt-dismissed")) return;
    } catch {}
    setDevice(selected);
    const show = () => {
      if (!dismissed.current && window.scrollY > 160) setVisible(true);
    };
    window.addEventListener("scroll", show, { passive: true });
    show();
    return () => window.removeEventListener("scroll", show);
  }, []);
  useEffect(() => {
    const element = prompt.current, root = element?.closest<HTMLElement>('.flixie-web');
    if (!element || !root) return;
    const update = () => { const height = Math.ceil(element.getBoundingClientRect().height); root.style.setProperty('--fx-app-prompt-clearance', `${height ? height + 24 : 12}px`); };
    update(); const observer = new ResizeObserver(update); observer.observe(element);
    return () => { observer.disconnect(); root.style.removeProperty('--fx-app-prompt-clearance'); };
  }, [visible, device]);
  function dismiss() {
    dismissed.current = true;
    setVisible(false);
    try {
      sessionStorage.setItem("flixie-app-prompt-dismissed", "1");
    } catch {}
  }
  if (!visible || !device) return null;
  return (
    <aside ref={prompt} className="fx-mobile-app-prompt" aria-label="Get the Flixie app">
      <img src="/web/flixie-f.png" alt="" width="38" height="38" />
      <div>
        <strong>Flixie on your phone</strong>
        <p>Keep your next watch close.</p>
      </div>
      <a
        className="fx-button fx-primary"
        href={device === "ios" ? site.iosUrl : site.androidUrl}
      >
        Get the app
      </a>
      <button
        className="fx-icon-button"
        aria-label="Dismiss app download prompt"
        onClick={dismiss}
      >
        <X size={18} />
      </button>
    </aside>
  );
}
