import type { TaskComment, TaskDetail } from "@/api/task";
import { AttachmentImageGrid } from "./attachment-image-grid";

type ImagePreviewProps = {
  onImagePreview: (imageUrl: string) => void;
};

export function InitialResultSection({
  onImagePreview,
  task
}: ImagePreviewProps & {
  task: TaskDetail;
}) {
  const firstComment = task.comments[0] ?? null;

  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <h2 className="text-[15px] font-black text-[#3F2C28]">최초 결과물</h2>
      <div className="mt-3 rounded-[16px] border border-[#F2C9C2] bg-white px-4 py-4">
        <p className="whitespace-pre-wrap text-[11px] font-bold leading-5 text-[#5A3E3B]">
          {firstComment?.content || "업무 진행 사항 및 요청사항이 없습니다."}
        </p>
      </div>
      <div className="mt-3 min-h-10 rounded-[14px] border border-[#F2C9C2] bg-white px-4 py-3">
        <p className={`text-[11px] font-bold leading-4 ${firstComment?.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
          {firstComment?.oneLineComment || "\u00A0"}
        </p>
      </div>
      {(firstComment?.attachments.length ?? 0) > 0 && (
        <>
          <p className="mt-4 text-[11px] font-black text-primary">첨부한 사진들</p>
          <AttachmentImageGrid
            attachments={firstComment?.attachments ?? []}
            onImagePreview={onImagePreview}
          />
        </>
      )}
    </section>
  );
}

export function CommentHistorySection({
  comments,
  onImagePreview
}: ImagePreviewProps & {
  comments: TaskComment[];
}) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <>
      {comments.map((comment) => (
        <CommentHistoryCard comment={comment} key={comment.id} onImagePreview={onImagePreview} />
      ))}
    </>
  );
}

function CommentHistoryCard({
  comment,
  onImagePreview
}: ImagePreviewProps & {
  comment: TaskComment;
}) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <h2 className="text-[15px] font-black text-[#3F2C28]">코멘트</h2>
      <div className="mt-3 rounded-[16px] border border-[#F2C9C2] bg-white px-4 py-4">
        <p className="whitespace-pre-wrap text-[11px] font-bold leading-5 text-[#5A3E3B]">
          {comment.content || "업무 진행 사항 및 요청사항이 없습니다."}
        </p>
      </div>
      <div className="mt-3 min-h-10 rounded-[14px] border border-[#F2C9C2] bg-white px-4 py-3">
        <p className={`text-[11px] font-bold leading-4 ${comment.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
          {comment.oneLineComment || "\u00A0"}
        </p>
      </div>
      {comment.attachments.length > 0 && (
        <>
          <p className="mt-4 text-[11px] font-black text-primary">첨부한 사진들</p>
          <AttachmentImageGrid attachments={comment.attachments} onImagePreview={onImagePreview} />
        </>
      )}
    </section>
  );
}
