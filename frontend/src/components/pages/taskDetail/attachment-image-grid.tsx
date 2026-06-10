type AttachmentImageGridProps = {
  attachments: Array<{
    id: number;
    imageUrl: string;
  }>;
  onImagePreview: (imageUrl: string) => void;
};

export function AttachmentImageGrid({ attachments, onImagePreview }: AttachmentImageGridProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <button
          className="w-20 overflow-hidden rounded-[14px] border border-[#F2C9C2] bg-[#FFF8F6] p-1 shadow-sm"
          key={attachment.id}
          onClick={() => onImagePreview(attachment.imageUrl)}
          type="button"
        >
          <img
            alt=""
            className="aspect-square w-full rounded-[11px] object-cover"
            src={attachment.imageUrl}
          />
        </button>
      ))}
    </div>
  );
}
