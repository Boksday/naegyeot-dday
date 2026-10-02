import type { Dday } from '../dday/types';
import { buildShareCardContent } from './shareCardContent';

const TODAY = '2026-10-02';

function makeDday(overrides: Partial<Dday>): Dday {
  return {
    id: 'id',
    title: '우리 만난 날',
    categoryId: 'couple',
    date: TODAY,
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

describe('buildShareCardContent', () => {
  it('다가오는 날은 남은 날과 날짜를 보여준다', () => {
    expect(buildShareCardContent(makeDday({ date: '2026-10-14' }), TODAY)).toEqual({
      title: '우리 만난 날',
      headline: 'D-12',
      caption: '2026년 10월 14일 (수)',
    });
  });

  it('당일은 D-Day', () => {
    expect(buildShareCardContent(makeDday({}), TODAY).headline).toBe('D-Day');
  });

  it('지난 날은 기준일을 1일째로 센 일수를 보여준다', () => {
    expect(buildShareCardContent(makeDday({ date: '2019-03-20' }), TODAY)).toEqual({
      title: '우리 만난 날',
      headline: '2,754일째',
      caption: '2019년 3월 20일 (수)부터',
    });
  });

  it('음력 디데이는 음력 날짜를 덧붙인다', () => {
    const content = buildShareCardContent(
      makeDday({
        date: '1990-03-31',
        calendar: 'lunar',
        lunar: { year: 1990, month: 3, day: 5, isLeapMonth: false },
        repeatYearly: true,
      }),
      TODAY,
    );
    expect(content.caption).toBe('2027년 4월 11일 (일) · 음력 3월 5일');
  });
});
