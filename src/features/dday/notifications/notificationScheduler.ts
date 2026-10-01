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
