"use client";

import { useEffect } from "react";

export function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        );

      if ("caches" in window) {
        void caches
          .keys()
          .then((cacheNames) =>
            Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))),
          );
      }

      return;
    }

    const registerServiceWorker = () => {
      void navigator.serviceWorker.register("/service-worker.js");
    };

    window.addEventListener("load", registerServiceWorker);

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}
