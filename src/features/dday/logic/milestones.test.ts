import { getMilestones } from './milestones';

describe('getMilestones', () => {
  it('100일째는 기준일 + 99일이다', () => {
    const summary = getMilestones('2026-01-01', '2026-01-01', 2);
    expect(summary?.latestPassed).toBeNull();
    expect(summary?.upcoming).toEqual([
      { dayCount: 100, date: '2026-04-10', daysUntil: 99 },
      { dayCount: 200, date: '2026-07-19', daysUntil: 199 },
    ]);
  });

  it('오늘이 기념일이면 다가오는 항목에 D-Day로 넣는다', () => {
    const summary = getMilestones('2026-01-01', '2026-04-10', 1);
    expect(summary?.latestPassed).toBeNull();
    expect(summary?.upcoming[0]).toEqual({ dayCount: 100, date: '2026-04-10', daysUntil: 0 });
  });

  it('지난 기념일 중 가장 최근 것을 돌려준다', () => {
    const summary = getMilestones('2026-01-01', '2026-04-11', 1);
    expect(summary?.latestPassed).toEqual({ dayCount: 100, date: '2026-04-10', daysUntil: -1 });
    expect(summary?.upcoming[0]?.dayCount).toBe(200);
  });

  it('기준일이 아직 오지 않았으면 계산하지 않는다', () => {
    expect(getMilestones('2026-10-03', '2026-10-02')).toBeNull();
  });
});
