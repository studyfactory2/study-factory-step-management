export class TaskStatusSummaryResponse {
  registered: number;
  registeredToday: number;
  inProgress: number;
  inProgressWeeklyChange: number;
  reviewRequested: number;
  reviewRequestedWeeklyChange: number;
  completedThisMonth: number;
}

export class TaskStatusSummaryByBranchResponse extends TaskStatusSummaryResponse {
  branch: string;
}
