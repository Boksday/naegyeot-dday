import type { Dday } from '../types';
import { MAX_SCHEDULED_NOTIFICATIONS, NOTIFY_HOUR, planNotifications } from './notificationPlan';

function makeDday(overrides: Partial<Dday>): Dday {
  return {
    id: 'id',
    title: '시험',
    date: '2026-10-10',
    category: 'personal',
    repeatYearly: false,
    notifyOnDay: true,
    notifyDaysBefore: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

const NOW = new Date(2026, 9, 2, 12, 0);

describe('planNotifications', () => {
  it('당일과 미리 알림을 알림 시각에 예약한다', () => {
    const planned = planNotifications([makeDday({ notifyDaysBefore: 3 })], NOW);
    expect(planned.map((item) => item.identifier)).toEqual([
      'id:before3:2026-10-07',
      'id:day:2026-10-10',
    ]);
    expect(planned[1]?.fireAt).toEqual(new Date(2026, 9, 10, NOTIFY_HOUR, 0));
    expect(planned[0]?.body).toBe('시험까지 3일 남았어요.');
  });

  it('이미 지난 시각의 알림은 예약하지 않는다', () => {
    const planned = planNotifications([makeDday({ date: '2026-10-02', notifyDaysBefore: 1 })], NOW);
    expect(planned).toEqual([]);
  });

  it('오늘 알림 시각 전이면 오늘 알림을 예약한다', () => {
    const morning = new Date(2026, 9, 2, NOTIFY_HOUR - 1, 0);
    const planned = planNotifications([makeDday({ date: '2026-10-02' })], morning);
    expect(planned.map((item) => item.identifier)).toEqual(['id:day:2026-10-02']);
  });

  it('매년 반복은 다음 두 해를 예약한다', () => {
    const planned = planNotifications(
      [makeDday({ date: '2000-05-01', repeatYearly: true, notifyDaysBefore: 1 })],
      NOW,
    );
    expect(planned.map((item) => item.identifier)).toEqual([
      'id:before1:2027-04-30',
      'id:day:2027-05-01',
      'id:before1:2028-04-30',
      'id:day:2028-05-01',
    ]);
  });

  it('알림이 꺼져 있으면 예약하지 않는다', () => {
    expect(planNotifications([makeDday({ notifyOnDay: false })], NOW)).toEqual([]);
  });

  it('최대 개수를 넘으면 가까운 알림만 남긴다', () => {
    const items = Array.from({ length: 40 }, (_, index) =>
      makeDday({
        id: `d${index}`,
        date: `2027-01-${String((index % 28) + 1).padStart(2, '0')}`,
        notifyDaysBefore: 1,
      }),
    );
    const planned = planNotifications(items, NOW);
    expect(planned).toHaveLength(MAX_SCHEDULED_NOTIFICATIONS);
    const times = planned.map((item) => item.fireAt.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});
