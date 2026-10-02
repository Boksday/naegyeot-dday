import type { Dday } from '../types';
import {
  formatDdayLabel,
  getDayCount,
  getDdayStatus,
  getOccurrences,
  sortForDisplay,
} from './ddayStatus';

const TODAY = '2026-10-02';

function makeDday(overrides: Partial<Dday>): Dday {
  return {
    id: 'id',
    title: '테스트',
    date: TODAY,
    categoryId: 'personal',
    repeatYearly: false,
    showMilestones: false,
    notifyOnDay: false,
    notifyDaysBefore: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('formatDdayLabel', () => {
  it('남은 날, 당일, 지난 날을 구분한다', () => {
    expect(formatDdayLabel(3)).toBe('D-3');
    expect(formatDdayLabel(0)).toBe('D-Day');
    expect(formatDdayLabel(-5)).toBe('D+5');
  });
});

describe('getDdayStatus', () => {
  it('반복하지 않으면 기준 날짜를 그대로 쓴다', () => {
    expect(getDdayStatus(makeDday({ date: '2026-10-12' }), TODAY).label).toBe('D-10');
    expect(getDdayStatus(makeDday({ date: '2026-09-22' }), TODAY).label).toBe('D+10');
  });

  it('매년 반복은 올해 날짜가 지났으면 내년 날짜를 쓴다', () => {
    const status = getDdayStatus(makeDday({ date: '2020-05-01', repeatYearly: true }), TODAY);
    expect(status.targetDate).toBe('2027-05-01');
  });

  it('매년 반복은 올해 날짜가 남았으면 올해 날짜를 쓴다', () => {
    const status = getDdayStatus(makeDday({ date: '2000-12-25', repeatYearly: true }), TODAY);
    expect(status.targetDate).toBe('2026-12-25');
  });

  it('매년 반복은 오늘이면 D-Day다', () => {
    expect(getDdayStatus(makeDday({ date: '1990-10-02', repeatYearly: true }), TODAY).label).toBe(
      'D-Day',
    );
  });

  it('매년 반복이라도 기준 날짜가 미래면 그 날짜를 쓴다', () => {
    const status = getDdayStatus(makeDday({ date: '2028-03-01', repeatYearly: true }), TODAY);
    expect(status.targetDate).toBe('2028-03-01');
  });
});

describe('getOccurrences', () => {
  it('2월 29일 반복은 평년에 2월 28일로 돌아온다', () => {
    const item = makeDday({ date: '2024-02-29', repeatYearly: true });
    expect(getOccurrences(item, TODAY, 3)).toEqual(['2027-02-28', '2028-02-29', '2029-02-28']);
  });

  it('반복하지 않으면 하나만 돌려준다', () => {
    expect(getOccurrences(makeDday({ date: '2026-12-01' }), TODAY, 3)).toEqual(['2026-12-01']);
  });
});

describe('getDayCount', () => {
  it('기준일을 1일째로 센다', () => {
    expect(getDayCount(TODAY, TODAY)).toBe(1);
    expect(getDayCount('2026-09-23', TODAY)).toBe(10);
    expect(getDayCount('2026-10-03', TODAY)).toBeNull();
  });
});

describe('sortForDisplay', () => {
  it('다가오는 디데이를 가까운 순으로, 지난 디데이는 최근 순으로 뒤에 둔다', () => {
    const items = [
      makeDday({ id: 'past-old', date: '2025-01-01' }),
      makeDday({ id: 'future-far', date: '2027-01-01' }),
      makeDday({ id: 'past-recent', date: '2026-09-30' }),
      makeDday({ id: 'today', date: TODAY }),
      makeDday({ id: 'future-near', date: '2026-10-05' }),
    ];
    expect(sortForDisplay(items, TODAY).map((item) => item.id)).toEqual([
      'today',
      'future-near',
      'future-far',
      'past-recent',
      'past-old',
    ]);
  });
});
