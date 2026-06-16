type ImagePreviewDialogProps = {
  imageUrl: string;
  onClose: () => void;
};

export function ImagePreviewDialog({ imageUrl, onClose }: ImagePreviewDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/55 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-full w-full max-w-[390px] rounded-[24px] border border-[#B9D5EF] bg-white p-4 shadow-[0_8px_0_#DCE8F5]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-5 top-5 z-10 h-9 rounded-full border border-[#A8CBEA] bg-[#EAF3FF] px-4 text-[13px] font-normal text-[#2D70CB] shadow-sm"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
        <img
          alt=""
          className="max-h-[78vh] w-full rounded-[18px] object-contain"
          src={imageUrl}
        />
      </div>
    </div>
  );
}
