import type { TaskDetail } from "@/api/task";

export function HighlightedDescription({ task }: { task: TaskDetail }) {
  if (!isDescriptionHighlightVisible(task)) {
    return <>{task.description}</>;
  }

  const start = task.descriptionHighlightStart ?? 0;
  const end = task.descriptionHighlightEnd ?? 0;

  return (
    <>
      {task.description.slice(0, start)}
      <span className="text-[#599BD7]">{task.description.slice(start, end)}</span>
      {task.description.slice(end)}
    </>
  );
}

function isDescriptionHighlightVisible(task: TaskDetail) {
  if (
    task.descriptionHighlightStart === null ||
    task.descriptionHighlightEnd === null ||
    !task.descriptionHighlightExpiresAt
  ) {
    return false;
  }

  return new Date(task.descriptionHighlightExpiresAt).getTime() > Date.now();
}
