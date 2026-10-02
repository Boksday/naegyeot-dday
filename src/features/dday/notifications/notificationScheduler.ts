import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Dday } from '../types';
import { planNotifications } from './notificationPlan';

const ANDROID_CHANNEL_ID = 'dday';

export type NotificationSyncResult = 'scheduled' | 'nothing-to-schedule' | 'permission-denied';

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: '디데이 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** 사용자가 알림을 켜고 저장할 때만 호출한다. */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  await ensureAndroidChannel();
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * 이 앱의 예약 알림을 모두 지우고 현재 디데이 기준으로 다시 예약한다.
 * 수정·삭제·중복 예약을 한 경로로 처리하기 위해 매번 전체를 다시 만든다.
 */
export async function syncNotifications(items: readonly Dday[]): Promise<NotificationSyncResult> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const planned = planNotifications(items, new Date());
  if (planned.length === 0) return 'nothing-to-schedule';

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return 'permission-denied';

  await ensureAndroidChannel();
  for (const notification of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: notification.identifier,
      content: {
        title: notification.title,
        body: notification.body,
        data: { ddayId: notification.ddayId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notification.fireAt,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  }
  return 'scheduled';
}

export type ScheduledSummary = { identifier: string; fireAt: string };

/** 개발 확인용: 지금 예약된 이 앱의 알림 목록 */
export async function getScheduledSummaries(): Promise<ScheduledSummary[]> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return requests.map((request) => {
    const time = readTriggerTime(request.trigger);
    return {
      identifier: request.identifier,
      fireAt: time === null ? '알 수 없음' : new Date(time).toLocaleString('ko-KR'),
    };
  });
}

/** 플랫폼마다 예약 트리거의 시각 필드 이름이 달라(value/date) 둘 다 확인한다. */
function readTriggerTime(trigger: unknown): number | null {
  if (typeof trigger !== 'object' || trigger === null) return null;
  for (const key of ['value', 'date']) {
    const value: unknown = Reflect.get(trigger, key);
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
  }
  return null;
}

/** 개발 확인용: 실제 알림과 같은 채널·트리거로 몇 초 뒤 알림을 보낸다. */
export async function scheduleTestNotification(delaySeconds: number): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: 'dev-test',
    content: { title: '테스트 알림', body: '알림이 잘 도착했어요.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: Date.now() + delaySeconds * 1000,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}
