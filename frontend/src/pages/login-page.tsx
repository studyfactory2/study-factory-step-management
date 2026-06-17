"use client";

import { type FormEvent, useEffect, useState } from "react";
import { login, type LoginResponse } from "@/api/auth";
import {
  getActiveOrganizationChart,
  organizationChartNodesToPositionTree
} from "@/api/organization-chart";
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

type LoginPositionTreeCache = {
  savedAt: number;
  positions: PositionTreeNode[];
};

const LOGIN_POSITION_TREE_CACHE_KEY = "study-factory:login-position-tree:v2";
const LOGIN_POSITION_TREE_CACHE_TTL_MS = 1000 * 60 * 30;

function readLoginPositionTreeCache(): PositionTreeNode[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cachedValue = window.localStorage.getItem(LOGIN_POSITION_TREE_CACHE_KEY);
    if (!cachedValue) {
      return null;
    }

    const cache = JSON.parse(cachedValue) as LoginPositionTreeCache;
    if (!Array.isArray(cache.positions) || Date.now() - cache.savedAt > LOGIN_POSITION_TREE_CACHE_TTL_MS) {
      window.localStorage.removeItem(LOGIN_POSITION_TREE_CACHE_KEY);
      return null;
    }

    return cache.positions;
  } catch {
    window.localStorage.removeItem(LOGIN_POSITION_TREE_CACHE_KEY);
    return null;
  }
}

function saveLoginPositionTreeCache(positions: PositionTreeNode[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LOGIN_POSITION_TREE_CACHE_KEY,
    JSON.stringify({
      savedAt: Date.now(),
      positions
    } satisfies LoginPositionTreeCache)
  );
}

async function fetchLoginPositionTree(): Promise<PositionTreeNode[]> {
  try {
    const chart = await getActiveOrganizationChart();
    return organizationChartNodesToPositionTree(chart.nodes);
  } catch {
    return getPositionTree();
  }
}

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
    let isMounted = true;
    const cachedPositionTree = readLoginPositionTreeCache();

    if (cachedPositionTree) {
      setPositions(cachedPositionTree);
      setSelectedPositionId(cachedPositionTree[0]?.id ?? null);
      setPositionTreeMessage("");
      setIsPositionTreeLoading(false);
    } else {
      setIsPositionTreeLoading(true);
    }

    fetchLoginPositionTree()
      .then((positionTree) => {
        if (!isMounted) {
          return;
        }

        setPositions(positionTree);
        setSelectedPositionId(positionTree[0]?.id ?? null);
        setPositionTreeMessage("");
        saveLoginPositionTreeCache(positionTree);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setPositions([]);
        setSelectedPositionId(null);
        setPositionTreeMessage("로그인 화면 조직도를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) {
          setIsPositionTreeLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-4 py-5 text-[#3F2C28] sm:px-6 lg:flex lg:items-center lg:py-8">
      <div className="mx-auto flex w-full max-w-[360px] flex-col lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-5">
        <div className="lg:min-w-0">
          <PositionTreeSection
            isLoading={isPositionTreeLoading}
            message={positionTreeMessage}
            onSelectPosition={setSelectedPositionId}
            positions={positions}
            selectedPositionId={selectedPositionId}
          />
          <TaskSummarySection branchSummaries={branchSummaries} />
        </div>

        <div className="lg:sticky lg:top-8">
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
        </div>
      </div>

      {isRegisterModalOpen && (
        <MemberRegisterDialog onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </main>
  );
}

export default LoginPage;
