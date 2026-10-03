import type { Dday } from '../dday/types';
import { buildMonthGrid, getEventsInRange, shiftMonth } from './calendarEvents';

function makeDday(id: string, overrides: Partial<Dday> = {}): Dday {
  return {
    id,
    title: id,
    categoryId: 'personal',
    date: '2026-10-15',
    repeatYearly: false,
    showMilestones: false,
    calendar: 'solar',
    lunar: null,
    order: 0,
    notifyOnDay: false,
    notifyDaysBefore: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

const OCT = ['2026-10-01', '2026-10-31'] as const;

describe('getEventsInRange', () => {
  it('반복하지 않는 디데이는 그 날짜에만 나온다', () => {
    expect(getEventsInRange([makeDday('a')], ...OCT).map((event) => event.date)).toEqual([
      '2026-10-15',
    ]);
    expect(getEventsInRange([makeDday('a')], '2026-11-01', '2026-11-30')).toEqual([]);
  });

  it('매년 반복은 해마다 같은 날, 기준 날짜 이후부터 나온다', () => {
    const birthday = makeDday('b', { date: '1990-10-20', repeatYearly: true });
    expect(getEventsInRange([birthday], ...OCT).map((event) => event.date)).toEqual(['2026-10-20']);
    const future = makeDday('f', { date: '2027-10-20', repeatYearly: true });
    expect(getEventsInRange([future], ...OCT)).toEqual([]);
  });

  it('음력 반복은 그해 양력 날짜로 나온다', () => {
    // 2027년 음력 1월 1일(설날) = 양력 2027-02-07
    const seollal = makeDday('s', {
      date: '2000-02-05',
      calendar: 'lunar',
      lunar: { year: 2000, month: 1, day: 1, isLeapMonth: false },
      repeatYearly: true,
    });
    expect(getEventsInRange([seollal], '2027-02-01', '2027-02-28').map((e) => e.date)).toEqual([
      '2027-02-07',
    ]);
  });

  it('100일 단위 기념일을 기준일 + (N-1)일에 표시한다', () => {
    const start = makeDday('m', { date: '2026-07-07', showMilestones: true });
    // 100일째 = 2026-10-14
    expect(getEventsInRange([start], ...OCT)).toEqual([
      {
        date: '2026-10-14',
        itemId: 'm',
        title: 'm',
        categoryId: 'personal',
        kind: 'milestone',
        dayCount: 100,
      },
    ]);
  });

  it('날짜순으로 정렬하고 같은 날은 디데이가 먼저다', () => {
    const events = getEventsInRange(
      [
        makeDday('late', { date: '2026-10-20' }),
        makeDday('m', { date: '2026-07-07', showMilestones: true }),
        makeDday('same', { date: '2026-10-14' }),
      ],
      ...OCT,
    );
    expect(events.map((event) => [event.date, event.itemId, event.kind])).toEqual([
      ['2026-10-14', 'same', 'dday'],
      ['2026-10-14', 'm', 'milestone'],
      ['2026-10-20', 'late', 'dday'],
    ]);
  });
});

describe('달력 칸', () => {
  it('일요일부터 6주를 채운다', () => {
    const cells = buildMonthGrid(2026, 10);
    expect(cells).toHaveLength(42);
    // 2026-10-01은 목요일이라 앞에 9월 27~30일이 온다.
    expect(cells[0]).toEqual({ date: '2026-09-27', isCurrentMonth: false });
    expect(cells[4]).toEqual({ date: '2026-10-01', isCurrentMonth: true });
  });

  it('연도를 넘겨 달을 옮긴다', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});
