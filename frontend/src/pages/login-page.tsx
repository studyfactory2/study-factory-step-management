"use client";

import { type FormEvent, useEffect, useState } from "react";
import { login, type LoginResponse } from "@/api/auth";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import {
  getTaskStatusSummaryByBranch,
  type TaskStatusSummaryByBranch
} from "@/api/task";
import {
  clearRememberedLoginName,
  getRememberedLoginName,
  saveAuth,
  saveRememberedLoginName
} from "@/lib/auth-storage";
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
  const [branchSummaries, setBranchSummaries] = useState<TaskStatusSummaryByBranch[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const rememberedName = getRememberedLoginName();

    if (rememberedName) {
      setName(rememberedName);
      setRememberName(true);
    }
  }, []);

  useEffect(() => {
    getTaskStatusSummaryByBranch()
      .then(setBranchSummaries)
      .catch(() => setBranchSummaries([]));
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
    <main className="login-pdf-font mx-auto flex min-h-dvh w-full max-w-[360px] flex-col bg-[#FFFEFC] px-4 py-5 text-[#3F2C28]">
      <PositionTreeSection
        isLoading={isPositionTreeLoading}
        message={positionTreeMessage}
        onSelectPosition={setSelectedPositionId}
        positions={positions}
        selectedPositionId={selectedPositionId}
      />
      <TaskSummarySection branchSummaries={branchSummaries} />
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
