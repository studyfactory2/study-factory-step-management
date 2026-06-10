type ImagePreviewDialogProps = {
  imageUrl: string;
  onClose: () => void;
};

export function ImagePreviewDialog({ imageUrl, onClose }: ImagePreviewDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/55 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-full w-full max-w-[390px] rounded-[24px] border border-[#F2C9C2] bg-white p-4 shadow-[0_8px_0_#EFC6BE]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-5 top-5 z-10 h-10 rounded-full bg-primary px-5 text-sm font-black text-white"
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
