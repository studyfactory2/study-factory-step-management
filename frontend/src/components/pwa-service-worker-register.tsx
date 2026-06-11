"use client";

import { useEffect } from "react";

export function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/service-worker.js");
    });
  }, []);

  return null;
}
