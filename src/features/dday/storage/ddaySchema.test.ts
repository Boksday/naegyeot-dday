import type { Dday } from '../types';
import { parseStoredData, serializeStoredData } from './ddaySchema';

const ITEM: Dday = {
  id: 'a',
  title: '우리 만난 날',
  date: '2025-03-01',
  repeatYearly: true,
  notifyOnDay: true,
  notifyDaysBefore: 3,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

describe('parseStoredData', () => {
  it('저장 기록이 없으면 빈 목록이다', () => {
    expect(parseStoredData(null)).toEqual({ ok: true, items: [] });
  });

  it('저장한 데이터를 그대로 읽는다', () => {
    expect(parseStoredData(serializeStoredData([ITEM]))).toEqual({ ok: true, items: [ITEM] });
  });

  it('JSON이 깨졌으면 실패한다', () => {
    expect(parseStoredData('{not json')).toEqual({ ok: false, reason: 'invalid-json' });
  });

  it('항목 하나라도 형식이 틀리면 실패한다', () => {
    const raw = JSON.stringify({ version: 1, items: [ITEM, { ...ITEM, date: '2025-02-30' }] });
    expect(parseStoredData(raw)).toEqual({ ok: false, reason: 'invalid-data' });
  });

  it('허용하지 않은 미리 알림 일수는 실패한다', () => {
    const raw = JSON.stringify({ version: 1, items: [{ ...ITEM, notifyDaysBefore: 5 }] });
    expect(parseStoredData(raw)).toEqual({ ok: false, reason: 'invalid-data' });
  });

  it('더 새로운 버전의 데이터는 덮어쓰지 않도록 실패한다', () => {
    const raw = JSON.stringify({ version: 2, items: [] });
    expect(parseStoredData(raw)).toEqual({ ok: false, reason: 'unsupported-version' });
  });
});
