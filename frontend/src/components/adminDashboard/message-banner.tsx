type MessageBannerProps = {
  message: string;
};

export function MessageBanner({ message }: MessageBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-5 py-4 text-sm font-black text-primary shadow-sm">
      {message}
    </div>
  );
}
