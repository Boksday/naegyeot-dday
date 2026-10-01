import { addDays, type LocalDate, toDateAtTime, toLocalDate } from '../logic/dates';
import { getOccurrences } from '../logic/ddayStatus';
import type { Dday } from '../types';

export const NOTIFY_HOUR = 9;
export const NOTIFY_MINUTE = 0;
/** 앱을 오래 열지 않아도 다음 해 알림이 남도록 반복 디데이는 두 번째 해까지 예약한다. */
export const REPEAT_OCCURRENCES_TO_SCHEDULE = 2;
/** iOS는 앱당 예약 알림을 64개까지만 유지하므로 여유를 둔다. */
export const MAX_SCHEDULED_NOTIFICATIONS = 60;

export type PlannedNotification = {
  identifier: string;
  ddayId: string;
  fireAt: Date;
  title: string;
  body: string;
};

function planForItem(item: Dday, now: Date): PlannedNotification[] {
  const today = toLocalDate(now);
  const occurrences = getOccurrences(item, today, REPEAT_OCCURRENCES_TO_SCHEDULE);
  const planned: PlannedNotification[] = [];

  const add = (fireDate: LocalDate, kind: string, body: string) => {
    const fireAt = toDateAtTime(fireDate, NOTIFY_HOUR, NOTIFY_MINUTE);
    if (fireAt.getTime() <= now.getTime()) return;
    planned.push({
      identifier: `${item.id}:${kind}:${fireDate}`,
      ddayId: item.id,
      fireAt,
      title: item.title,
      body,
    });
  };

  for (const occurrence of occurrences) {
    if (item.notifyOnDay) add(occurrence, 'day', `오늘은 ${item.title} D-Day예요.`);
    if (item.notifyDaysBefore !== null) {
      const days = item.notifyDaysBefore;
      add(addDays(occurrence, -days), `before${days}`, `${item.title}까지 ${days}일 남았어요.`);
    }
  }
  return planned;
}

/** 지금 예약해야 할 전체 알림. 가까운 순으로 최대 개수까지만 돌려준다. */
export function planNotifications(items: readonly Dday[], now: Date): PlannedNotification[] {
  return items
    .flatMap((item) => planForItem(item, now))
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}
