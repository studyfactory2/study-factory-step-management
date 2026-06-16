"use client";

import { useEffect, useRef, useState } from "react";

const REFRESH_THRESHOLD = 78;
const MAX_PULL_DISTANCE = 104;

function isInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("button, input, textarea, select, a, [role='button']"));
}

function getPullDistance(startY: number, currentY: number) {
  const distance = currentY - startY;

  if (distance <= 0) {
    return 0;
  }

  return Math.min(distance * 0.55, MAX_PULL_DISTANCE);
}

export function PullToRefresh() {
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      if (window.scrollY > 0 || isInteractiveElement(event.target)) {
        isPullingRef.current = false;
        return;
      }

      startYRef.current = event.touches[0]?.clientY ?? 0;
      isPullingRef.current = true;
      setPullDistance(0);
    }

    function handleTouchMove(event: TouchEvent) {
      if (!isPullingRef.current || isRefreshing) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const distance = getPullDistance(startYRef.current, currentY);
      setPullDistance(distance);
    }

    function handleTouchEnd() {
      if (!isPullingRef.current || isRefreshing) {
        return;
      }

      isPullingRef.current = false;

      if (pullDistance >= REFRESH_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(REFRESH_THRESHOLD);
        window.setTimeout(() => window.location.reload(), 180);
        return;
      }

      setPullDistance(0);
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isRefreshing, pullDistance]);

  const isVisible = pullDistance > 4 || isRefreshing;
  const isReady = pullDistance >= REFRESH_THRESHOLD;

  return (
    <div
      aria-hidden={!isVisible}
      className={`pointer-events-none fixed left-1/2 top-3 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#F1CFD5] bg-[#FFFEFC]/95 px-3 py-2 text-[13px] font-black text-[#8F7470] shadow-[0_10px_22px_rgba(239,126,158,0.16)] backdrop-blur transition-opacity duration-150 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: `translate(-50%, ${Math.min(pullDistance * 0.36, 36)}px)`
      }}
    >
      <span className={`text-primary transition-transform ${isReady || isRefreshing ? "rotate-180" : ""}`}>
        ↓
      </span>
      {isRefreshing ? "새로고침 중..." : isReady ? "놓으면 새로고침" : "아래로 당겨 새로고침"}
    </div>
  );
}
