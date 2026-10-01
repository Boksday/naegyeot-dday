import {
  addDays,
  daysBetween,
  formatKoreanDate,
  isLeapYear,
  isValidLocalDate,
  sameDayInYear,
  toLocalDate,
} from './dates';

describe('isValidLocalDate', () => {
  it('실제로 존재하는 날짜만 허용한다', () => {
    expect(isValidLocalDate('2024-02-29')).toBe(true);
    expect(isValidLocalDate('2025-02-29')).toBe(false);
    expect(isValidLocalDate('2026-13-01')).toBe(false);
    expect(isValidLocalDate('2026-04-31')).toBe(false);
    expect(isValidLocalDate('2026-4-1')).toBe(false);
    expect(isValidLocalDate('')).toBe(false);
  });
});

describe('isLeapYear', () => {
  it('400년 규칙을 따른다', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe('daysBetween', () => {
  it('월·연도 경계를 넘어 일수를 센다', () => {
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    expect(daysBetween('2026-10-02', '2026-10-02')).toBe(0);
    expect(daysBetween('2026-10-02', '2026-09-30')).toBe(-2);
  });
});

describe('addDays', () => {
  it('윤년과 연말을 처리한다', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('sameDayInYear', () => {
  it('윤년이 아닌 해의 2월 29일은 2월 28일로 맞춘다', () => {
    expect(sameDayInYear('2024-02-29', 2025)).toBe('2025-02-28');
    expect(sameDayInYear('2024-02-29', 2028)).toBe('2028-02-29');
    expect(sameDayInYear('2020-05-01', 2026)).toBe('2026-05-01');
  });
});

describe('toLocalDate', () => {
  it('기기 시간대 기준 날짜를 돌려준다', () => {
    expect(toLocalDate(new Date(2026, 9, 2, 23, 59))).toBe('2026-10-02');
    expect(toLocalDate(new Date(2026, 9, 3, 0, 0))).toBe('2026-10-03');
  });
});

describe('formatKoreanDate', () => {
  it('요일을 포함해 표시한다', () => {
    expect(formatKoreanDate('2026-10-02')).toBe('2026년 10월 2일 (금)');
  });
});
