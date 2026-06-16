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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#222222]/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-[18px] border border-[#D8D1CE] bg-[#FFFEFC] p-5 text-center shadow-[0_12px_30px_rgba(60,52,48,0.16)]">
        <p className="text-[22px] font-normal text-[#111111]">{title}</p>
        <p className="mt-2 break-keep text-[15px] font-normal leading-5 text-[#7B716D]">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="h-10 rounded-[12px] border border-[#D8D1CE] bg-white text-[16px] font-normal text-[#4F4542]"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-10 rounded-[12px] border border-[#8FBDF0] bg-[#EAF4FF] text-[16px] font-normal text-[#1171E8]"
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
