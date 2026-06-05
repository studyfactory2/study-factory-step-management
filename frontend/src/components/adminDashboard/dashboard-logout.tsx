type DashboardLogoutProps = {
  onLogout: () => void;
};

export function DashboardLogout({ onLogout }: DashboardLogoutProps) {
  return (
    <button
      className="mx-auto block rounded-full border border-[#F2C9C2] bg-white px-6 py-2 text-sm font-semibold text-[#9B7A75]"
      onClick={onLogout}
      type="button"
    >
      로그아웃
    </button>
  );
}
