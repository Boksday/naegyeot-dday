import { requestPinWidget } from 'react-native-android-widget';

import { WIDGET_NAME } from './widgetEntries';

/** 런처의 위젯 추가 창을 띄운다. false면 런처가 지원하지 않는다. */
export async function pinWidget(): Promise<boolean> {
  return requestPinWidget({ widgetName: WIDGET_NAME });
}
