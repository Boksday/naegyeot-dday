import {
  formatLunarDate,
  hasLeapMonth,
  lunarMonthLength,
  lunarToSolarExact,
  lunarToSolarForYear,
  solarToLunar,
} from './lunar';

const plain = (year: number, month: number, day: number) => ({
  year,
  month,
  day,
  isLeapMonth: false,
});

describe('음력 ↔ 양력 (한국천문연구원 기준)', () => {
  it('설날과 추석을 양력으로 바꾼다', () => {
    expect(lunarToSolarExact(plain(2025, 1, 1))).toBe('2025-01-29');
    expect(lunarToSolarExact(plain(2026, 1, 1))).toBe('2026-02-17');
    expect(lunarToSolarExact(plain(2024, 8, 15))).toBe('2024-09-17');
    expect(lunarToSolarExact(plain(2026, 8, 15))).toBe('2026-09-25');
  });

  it('양력을 음력으로 바꾼다', () => {
    expect(solarToLunar('2026-10-02')).toEqual(plain(2026, 8, 22));
    expect(solarToLunar('2023-03-22')).toEqual({ year: 2023, month: 2, day: 1, isLeapMonth: true });
  });

  it('없는 날짜는 정확한 변환에서 실패한다', () => {
    expect(lunarToSolarExact(plain(2026, 2, 30))).toBeNull();
    expect(lunarToSolarExact({ year: 2024, month: 2, day: 1, isLeapMonth: true })).toBeNull();
  });
});

describe('lunarToSolarForYear', () => {
  it('윤달 날짜는 그해에 윤달이 없으면 평달로 챙긴다', () => {
    const leapBirthday = { year: 2023, month: 2, day: 1, isLeapMonth: true };
    expect(lunarToSolarForYear(leapBirthday, 2023)).toBe('2023-03-22');
    expect(lunarToSolarForYear(leapBirthday, 2024)).toBe(lunarToSolarExact(plain(2024, 2, 1)));
  });

  it('30일이 없는 달은 29일로 챙긴다', () => {
    expect(lunarToSolarForYear(plain(2000, 2, 30), 2026)).toBe(
      lunarToSolarExact(plain(2026, 2, 29)),
    );
  });

  it('지원 범위를 벗어나면 null', () => {
    expect(lunarToSolarForYear(plain(2000, 1, 1), 2051)).toBeNull();
  });
});

describe('달 정보', () => {
  it('달의 길이와 윤달 여부를 알려준다', () => {
    expect(lunarMonthLength(2026, 1, false)).toBe(30);
    expect(lunarMonthLength(2026, 2, false)).toBe(29);
    expect(hasLeapMonth(2025, 6)).toBe(true);
    expect(hasLeapMonth(2026, 6)).toBe(false);
  });

  it('음력 날짜를 표시한다', () => {
    expect(formatLunarDate(plain(1990, 3, 5))).toBe('음력 3월 5일');
    expect(formatLunarDate({ year: 2025, month: 6, day: 1, isLeapMonth: true }, true)).toBe(
      '음력 2025년 윤6월 1일',
    );
  });
});
