type AttachmentImageGridProps = {
  attachments: Array<{
    id: number;
    imageUrl: string;
  }>;
  onImagePreview: (imageUrl: string) => void;
};

export function AttachmentImageGrid({ attachments, onImagePreview }: AttachmentImageGridProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {attachments.map((attachment) => (
        <button
          className="w-28 overflow-hidden rounded-[18px] border border-[#F2C9C2] bg-[#FFF8F6] p-1.5 shadow-sm "
          key={attachment.id}
          onClick={() => onImagePreview(attachment.imageUrl)}
          type="button"
        >
          <img
            alt=""
            className="aspect-square w-full rounded-[14px] object-cover"
            src={attachment.imageUrl}
          />
        </button>
      ))}
    </div>
  );
}
