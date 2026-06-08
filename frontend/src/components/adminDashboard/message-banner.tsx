type MessageBannerProps = {
  message: string;
};

export function MessageBanner({ message }: MessageBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-[18px] border border-[#F2C9C2] bg-[#FFFEFC] px-5 py-4 text-sm font-semibold text-primary">
      {message}
    </div>
  );
}
