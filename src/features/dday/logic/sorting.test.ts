import type { Dday } from '../types';
import { applyManualOrder, nextOrder, sortDdays } from './sorting';

const TODAY = '2026-10-02';

function makeDday(id: string, overrides: Partial<Dday> = {}): Dday {
  return {
    id,
    title: id,
    categoryId: 'personal',
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

const ids = (items: readonly Dday[]) => items.map((item) => item.id);

describe('sortDdays', () => {
  const items = [
    makeDday('b', {
      title: '나비',
      date: '2026-12-01',
      order: 2,
      createdAt: '2026-10-01T03:00:00Z',
    }),
    makeDday('a', {
      title: '가방',
      date: '2026-10-05',
      order: 1,
      createdAt: '2026-10-01T01:00:00Z',
    }),
    makeDday('c', {
      title: '다리',
      date: '2026-09-01',
      order: 0,
      createdAt: '2026-10-01T02:00:00Z',
    }),
  ];

  it('가까운 순은 다가오는 디데이 먼저, 지난 디데이는 뒤에 둔다', () => {
    expect(ids(sortDdays(items, 'upcoming', TODAY))).toEqual(['a', 'b', 'c']);
  });

  it('직접 정렬은 order 순서다', () => {
    expect(ids(sortDdays(items, 'manual', TODAY))).toEqual(['c', 'a', 'b']);
  });

  it('최근 추가 순은 만든 시각의 역순이다', () => {
    expect(ids(sortDdays(items, 'recent', TODAY))).toEqual(['b', 'c', 'a']);
  });

  it('이름순은 한글 가나다순이다', () => {
    expect(ids(sortDdays(items, 'title', TODAY))).toEqual(['a', 'b', 'c']);
  });
});

describe('nextOrder', () => {
  it('가장 큰 순서 다음 값을 준다', () => {
    expect(nextOrder([])).toBe(0);
    expect(nextOrder([makeDday('a', { order: 4 }), makeDday('b', { order: 1 })])).toBe(5);
  });
});

describe('applyManualOrder', () => {
  const items = [
    makeDday('a', { order: 0 }),
    makeDday('b', { order: 1 }),
    makeDday('c', { order: 2 }),
    makeDday('d', { order: 3 }),
  ];

  it('전체 순서를 바꾼다', () => {
    const next = applyManualOrder(items, ['d', 'a', 'b', 'c']);
    expect(ids(sortDdays(next, 'manual', TODAY))).toEqual(['d', 'a', 'b', 'c']);
  });

  it('일부만 옮기면 나머지의 자리는 그대로다', () => {
    // b와 d만 보이는 상태에서 d를 b 앞으로 옮긴다.
    const next = applyManualOrder(items, ['d', 'b']);
    expect(ids(sortDdays(next, 'manual', TODAY))).toEqual(['a', 'd', 'c', 'b']);
  });

  it('바뀌지 않은 디데이는 같은 객체를 유지한다', () => {
    const next = applyManualOrder(items, ['a', 'b', 'c', 'd']);
    expect(next[0]).toBe(items[0]);
  });

  it('없는 디데이가 섞이면 실패한다', () => {
    expect(() => applyManualOrder(items, ['a', 'ghost'])).toThrow();
  });
});
