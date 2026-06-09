"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HelpRequestPage } from "@/pages/help-request-page";
import { getStoredAuth } from "@/lib/auth-storage";

type HelpRequestRoutePageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default function HelpRequestRoutePage({ params }: HelpRequestRoutePageProps) {
  const { taskId } = use(params);
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [isReady, setIsReady] = useState(false);
  const parsedTaskId = Number(taskId);

  useEffect(() => {
    const auth = getStoredAuth();

    if (!Number.isFinite(parsedTaskId)) {
      router.replace("/employee-dashboard");
      return;
    }

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setAccessToken(auth.accessToken);
    setIsReady(true);
  }, [parsedTaskId, router]);

  if (!isReady || !accessToken) {
    return null;
  }

  return (
    <HelpRequestPage
      accessToken={accessToken}
      onBack={() => router.push(`/tasks/${parsedTaskId}`)}
    />
  );
}
