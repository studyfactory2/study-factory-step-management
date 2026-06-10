"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { login, type LoginResponse } from "@/api/auth";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import { getTaskStatusSummary, type TaskStatusSummary } from "@/api/task";
import {
  clearRememberedLoginName,
  getRememberedLoginName,
  saveAuth,
  saveRememberedLoginName
} from "@/lib/auth-storage";
import { defaultSummary } from "@/components/pages/login/constants";
import { LoginFormSection } from "@/components/pages/login/login-form-section";
import { MemberRegisterDialog } from "@/components/pages/login/member-register-dialog";
import { PositionTreeSection } from "@/components/pages/login/position-tree-section";
import { TaskSummarySection } from "@/components/pages/login/task-summary-section";

type LoginPageProps = {
  onLogin?: (response: LoginResponse) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberName, setRememberName] = useState(false);
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [isPositionTreeLoading, setIsPositionTreeLoading] = useState(true);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [positionTreeMessage, setPositionTreeMessage] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskStatusSummary>(defaultSummary);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const rememberedName = getRememberedLoginName();

    if (rememberedName) {
      setName(rememberedName);
      setRememberName(true);
    }
  }, []);

  useEffect(() => {
    getTaskStatusSummary()
      .then(setTaskSummary)
      .catch(() => setTaskSummary(defaultSummary));
  }, []);

  useEffect(() => {
    setIsPositionTreeLoading(true);
    getPositionTree()
      .then((positionTree) => {
        setPositions(positionTree);
        setSelectedPositionId(positionTree[0]?.id ?? null);
        setPositionTreeMessage("");
      })
      .catch(() => {
        setPositions([]);
        setSelectedPositionId(null);
        setPositionTreeMessage("로그인 화면 조직도를 불러오지 못했습니다.");
      })
      .finally(() => setIsPositionTreeLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        name,
        password
      });

      saveAuth(response);
      if (rememberName) {
        saveRememberedLoginName(name);
      } else {
        clearRememberedLoginName();
      }
      setMessage(`${response.member.name}님, 로그인되었습니다.`);
      onLogin?.(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRememberNameChange(isChecked: boolean) {
    setRememberName(isChecked);

    if (!isChecked) {
      clearRememberedLoginName();
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[360px] flex-col px-5 py-4 text-[#4B332E] ">
      <div className="pointer-events-none fixed left-8 top-12 text-[#F0C957]">
        <Sparkles aria-hidden className="h-7 w-7 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-9 top-20 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-6 w-6 fill-current" />
      </div>

      <header className="mb-3 pt-1 text-center">
        <h1 className="whitespace-nowrap text-[23px] font-bold leading-tight tracking-normal text-muted-foreground">
          자격증공장 업무전달현황
        </h1>
      </header>

      <PositionTreeSection
        isLoading={isPositionTreeLoading}
        message={positionTreeMessage}
        onSelectPosition={setSelectedPositionId}
        positions={positions}
        selectedPositionId={selectedPositionId}
      />
      <TaskSummarySection taskSummary={taskSummary} />
      <LoginFormSection
        isPasswordVisible={isPasswordVisible}
        isSubmitting={isSubmitting}
        message={message}
        name={name}
        onNameChange={setName}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onPasswordChange={setPassword}
        onRememberNameChange={handleRememberNameChange}
        onSubmit={handleSubmit}
        onTogglePasswordVisible={() => setIsPasswordVisible((current) => !current)}
        password={password}
        rememberName={rememberName}
      />

      {isRegisterModalOpen && (
        <MemberRegisterDialog onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </main>
  );
}

export default LoginPage;
