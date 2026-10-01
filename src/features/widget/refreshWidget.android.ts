import { requestWidgetUpdate } from 'react-native-android-widget';

import { WIDGET_NAME } from './widgetEntries';
import { renderDdayWidget } from './widgetTaskHandler';

export async function refreshWidget(): Promise<void> {
  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: renderDdayWidget,
    // 위젯을 추가하지 않은 사용자에게는 할 일이 없다.
    widgetNotFound: () => {},
  });
}
