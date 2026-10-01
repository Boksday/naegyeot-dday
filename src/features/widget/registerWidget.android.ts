import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './widgetTaskHandler';

export function registerWidget(): void {
  registerWidgetTaskHandler(widgetTaskHandler);
}
