import { handleUnauthorizedResponse } from "@/api/client";
import type { MemberRole, TaskStatus } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiErrorResponse = {
  message?: string | string[];
};

export type HelpRequestCreateRequest = {
  attachments?: File[];
  content: string;
  receiverId: number;
  taskId: number;
};

export type HelpRequestAttachment = {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: string;
};

export type HelpRequestReceived = {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterRoleType: MemberRole;
  requesterPositionName: string | null;
  taskId: number;
  taskTitle: string;
  taskStatus: TaskStatus;
  oneLineComment: string;
  attachments: HelpRequestAttachment[];
  requestedAt: string;
};

function getErrorMessage(error: ApiErrorResponse | null, fallbackMessage: string) {
  return Array.isArray(error?.message) ? error.message[0] : error?.message ?? fallbackMessage;
}

export async function createHelpRequest(
  accessToken: string,
  request: HelpRequestCreateRequest
): Promise<HelpRequestReceived> {
  const formData = new FormData();
  formData.append("taskId", String(request.taskId));
  formData.append("receiverId", String(request.receiverId));
  formData.append("content", request.content);
  request.attachments?.forEach((attachment) => {
    formData.append("attachments", attachment);
  });

  const response = await fetch(`${API_BASE_URL}/api/help-requests`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "도움요청을 등록하지 못했습니다."));
  }

  return response.json() as Promise<HelpRequestReceived>;
}

export async function getReceivedHelpRequests(accessToken: string): Promise<HelpRequestReceived[]> {
  const response = await fetch(`${API_BASE_URL}/api/help-requests/received`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "도움요청 받은 업무를 불러오지 못했습니다."));
  }

  return response.json() as Promise<HelpRequestReceived[]>;
}
