import { addDays, daysBetween, type LocalDate } from './dates';

export const MILESTONE_STEP_DAYS = 100;
const DEFAULT_UPCOMING_COUNT = 5;

export type Milestone = {
  /** 기준일을 1일째로 센 일수 (100, 200, ...) */
  dayCount: number;
  date: LocalDate;
  daysUntil: number;
};

export type MilestoneSummary = {
  latestPassed: Milestone | null;
  upcoming: Milestone[];
};

function milestoneAt(start: LocalDate, dayCount: number, today: LocalDate): Milestone {
  // 한국식으로 기준일이 1일째라서 N일째는 기준일 + (N - 1)일이다.
  const date = addDays(start, dayCount - 1);
  return { dayCount, date, daysUntil: daysBetween(today, date) };
}

/** 기준일이 오늘이거나 지났을 때만 100일 단위 기념일을 계산한다. */
export function getMilestones(
  start: LocalDate,
  today: LocalDate,
  upcomingCount: number = DEFAULT_UPCOMING_COUNT,
): MilestoneSummary | null {
  const elapsed = daysBetween(start, today);
  if (elapsed < 0) return null;

  const todayCount = elapsed + 1;
  const passedSteps = Math.floor(todayCount / MILESTONE_STEP_DAYS);
  // 오늘이 기념일이면 지난 것이 아니라 다가오는(D-Day) 항목으로 보여준다.
  const isTodayMilestone = todayCount % MILESTONE_STEP_DAYS === 0;
  const latestPassedSteps = isTodayMilestone ? passedSteps - 1 : passedSteps;
  const firstUpcomingSteps = latestPassedSteps + 1;

  return {
    latestPassed:
      latestPassedSteps > 0
        ? milestoneAt(start, latestPassedSteps * MILESTONE_STEP_DAYS, today)
        : null,
    upcoming: Array.from({ length: upcomingCount }, (_, index) =>
      milestoneAt(start, (firstUpcomingSteps + index) * MILESTONE_STEP_DAYS, today),
    ),
  };
}
