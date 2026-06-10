type ConfirmDialogProps = {
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  title
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3F2C28]/35 px-4">
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] p-7 text-center shadow-[0_18px_44px_rgba(90,62,59,0.2)]">
        <p className="text-2xl font-black text-[#3F2C28]">{title}</p>
        <p className="mt-3 text-sm font-bold leading-6 text-[#8F7470]">{description}</p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-full border border-[#F0B9C8] bg-white text-sm font-black text-primary"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 rounded-full bg-primary text-sm font-black text-white shadow-sm"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
