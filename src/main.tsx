import { StrictMode } from "react";
import "./i18n";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Global guard: recover from dynamic import chunk failures on GH Pages
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    const msg = String((e as any)?.message || "");
    if (
      msg.includes("Loading chunk") ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Failed to fetch dynamically imported module")
    ) {
      const url = `${window.location.origin}${window.location.pathname}?nocache=${Date.now()}`;
      window.location.replace(url);
    }
  });

  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    const msg = String((e.reason as any)?.message || e.reason || "");
    if (
      msg.includes("Loading chunk") ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Failed to fetch dynamically imported module")
    ) {
      const url = `${window.location.origin}${window.location.pathname}?nocache=${Date.now()}`;
      window.location.replace(url);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
