"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Camera, MapPin, Phone, X } from "lucide-react";
import { registerMember } from "@/api/member";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import { CustomDropdown } from "@/components/pages/memberPreRegister/components";
import {
  flattenPositions,
  formatPhoneInput,
  organizationOptions,
  residenceOptions
} from "@/components/pages/memberPreRegister/utils";

export function MemberRegisterDialog({ onClose }: { onClose: () => void }) {
  const [avatar, setAvatar] = useState<File | undefined>();
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerBirthDate, setRegisterBirthDate] = useState("");
  const [registerOrganization, setRegisterOrganization] = useState("자격증공장");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState("");
  const [registerPositionId, setRegisterPositionId] = useState<number | "">("");
  const [registerResidenceCity, setRegisterResidenceCity] = useState("");
  const [registerResidenceDistrict, setRegisterResidenceDistrict] = useState("");
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flatPositions = useMemo(() => flattenPositions(positions), [positions]);
  const selectablePositions = flatPositions.filter((position) => !position.isAdmin && position.isActive);
  const residenceCityOptions = Object.keys(residenceOptions);
  const residenceDistrictOptions = registerResidenceCity ? residenceOptions[registerResidenceCity] ?? [] : [];

  useEffect(() => {
    getPositionTree()
      .then(setPositions)
      .catch(() => setPositions([]));
  }, []);

  useEffect(() => {
    if (!avatar) {
      setAvatarPreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(avatar);
    setAvatarPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [avatar]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedAvatar = event.target.files?.[0];
    setAvatar(selectedAvatar);
  }

  function handleResidenceCityChange(value: string) {
    setRegisterResidenceCity(value);
    setRegisterResidenceDistrict("");
  }

  function resetForm() {
    setAvatar(undefined);
    setRegisterName("");
    setRegisterBirthDate("");
    setRegisterOrganization("자격증공장");
    setRegisterPassword("");
    setRegisterPhoneNumber("");
    setRegisterPositionId("");
    setRegisterResidenceCity("");
    setRegisterResidenceDistrict("");
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !registerOrganization.trim()
      || !registerPositionId
      || !registerName.trim()
      || !registerPassword.trim()
      || !registerBirthDate.trim()
      || !registerResidenceCity.trim()
      || !registerResidenceDistrict.trim()
      || !registerPhoneNumber.trim()
    ) {
      setMessage("소속, 직위, 이름, 비밀번호, 생년월일, 거주지, 전화번호를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerMember({
        avatar,
        birthDate: registerBirthDate,
        name: registerName,
        organization: registerOrganization,
        password: registerPassword,
        phoneNumber: registerPhoneNumber,
        positionId: Number(registerPositionId),
        residenceCity: registerResidenceCity,
        residenceDistrict: registerResidenceDistrict
      });
      setMessage("직원 등록이 완료되었습니다. 로그인해주세요.");
      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직원 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F3A43]/30 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-48px)] w-full max-w-[324px] overflow-y-auto rounded-[18px] border border-[#D8D1CE] bg-[#FFFEFC] p-4 shadow-[0_18px_48px_rgba(65,52,48,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-normal tracking-normal text-[#222222]">직원 등록</h2>
            <p className="mt-1 text-[12px] font-normal leading-5 text-[#7B716D]">
              사전등록된 소속, 직위, 이름과 일치해야 가입됩니다.
            </p>
          </div>
          <button
            aria-label="직원 등록 닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm transition hover:bg-[#F7F7F7]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-4 space-y-2.5" onSubmit={handleRegisterSubmit}>
          <label className="mx-auto flex h-[88px] w-[88px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border border-dashed border-[#B9B1AD] bg-[#FAFAFA] text-[11px] font-normal text-[#7B716D]">
            {avatarPreviewUrl ? (
              <img alt="프로필 미리보기" className="h-full w-full object-cover" src={avatarPreviewUrl} />
            ) : (
              <>
                <Camera aria-hidden className="h-5 w-5 text-[#8C817D]" />
                사진 추가
                <span className="text-[9px] text-[#A69E9A]">필수 아님</span>
              </>
            )}
            <input accept="image/*" className="sr-only" onChange={handleAvatarChange} type="file" />
          </label>

          <CustomDropdown
            onChange={setRegisterOrganization}
            options={organizationOptions.map((option) => ({
              label: option,
              value: option
            }))}
            placeholder="소속"
            value={registerOrganization}
          />
          <CustomDropdown
            onChange={(value) => setRegisterPositionId(value ? Number(value) : "")}
            options={selectablePositions.map((position) => ({
              depth: position.depth,
              label: position.name,
              value: String(position.id)
            }))}
            placeholder="직위"
            value={registerPositionId ? String(registerPositionId) : ""}
          />
          <input
            className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A] focus:border-[#9DC7ED] focus:bg-[#F4FAFF] focus:shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
            onChange={(event) => setRegisterName(event.target.value)}
            placeholder="이름"
            required
            type="text"
            value={registerName}
          />
          <input
            className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A] focus:border-[#9DC7ED] focus:bg-[#F4FAFF] focus:shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
            inputMode="numeric"
            maxLength={4}
            minLength={4}
            onChange={(event) => setRegisterPassword(event.target.value)}
            placeholder="비밀번호 4자리"
            required
            type="password"
            value={registerPassword}
          />
          <div className="relative">
            <CalendarDays aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8B91]" />
            <input
              className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white pl-9 pr-3 text-[13px] font-normal text-[#222222] outline-none focus:border-[#9DC7ED] focus:bg-[#F4FAFF] focus:shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
              onChange={(event) => setRegisterBirthDate(event.target.value)}
              required
              type="date"
              value={registerBirthDate}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CustomDropdown
              icon={<MapPin aria-hidden className="h-4 w-4 text-[#7B8B91]" />}
              onChange={handleResidenceCityChange}
              options={residenceCityOptions.map((option) => ({
                label: option,
                value: option
              }))}
              placeholder="시"
              value={registerResidenceCity}
            />
            <CustomDropdown
              disabled={!registerResidenceCity}
              onChange={setRegisterResidenceDistrict}
              options={residenceDistrictOptions.map((option) => ({
                label: option,
                value: option
              }))}
              placeholder="구"
              value={registerResidenceDistrict}
            />
          </div>
          <div className="relative">
            <Phone aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8B91]" />
            <input
              className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-9 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A] focus:border-[#9DC7ED] focus:bg-[#F4FAFF] focus:shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
              inputMode="numeric"
              maxLength={13}
              onChange={(event) => setRegisterPhoneNumber(formatPhoneInput(event.target.value))}
              placeholder="번호만 입력해주세요"
              required
              type="tel"
              value={registerPhoneNumber}
            />
          </div>

          {message && (
            <p className="rounded-[10px] border border-[#B9D7EF] bg-[#F3FAFF] px-3 py-2.5 text-center text-[12px] font-normal text-[#416A83]">
              {message}
            </p>
          )}

          <button
            className="flex h-10 w-full items-center justify-center rounded-[10px] border border-[#B9D7EF] bg-[#D8ECFF] px-4 text-[13px] font-normal text-[#2D70CB] shadow-sm transition hover:bg-[#CFE7FF] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "등록 중" : "직원 등록"}
          </button>
        </form>
      </section>
    </div>
  );
}
