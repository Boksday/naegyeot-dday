import 'expo-router/entry';

import { configureNotificationHandler } from './src/features/dday/notifications/notificationScheduler';
import { registerWidget } from './src/features/widget/registerWidget';

configureNotificationHandler();
registerWidget();
