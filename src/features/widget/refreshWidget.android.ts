import { requestWidgetUpdate } from 'react-native-android-widget';

import { CALENDAR_WIDGET_NAME } from './DdayCalendarWidget';
import { WIDGET_NAME } from './widgetEntries';
import { renderCalendarWidget, renderDdayWidget } from './widgetTaskHandler';

export async function refreshWidget(): Promise<void> {
  // 위젯을 추가하지 않은 사용자에게는 할 일이 없다.
  await Promise.all([
    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: renderDdayWidget,
      widgetNotFound: () => {},
    }),
    requestWidgetUpdate({
      widgetName: CALENDAR_WIDGET_NAME,
      renderWidget: renderCalendarWidget,
      widgetNotFound: () => {},
    }),
  ]);
}
