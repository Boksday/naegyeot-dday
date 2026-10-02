import { StyleSheet, View } from 'react-native';
import { WidgetPreview } from 'react-native-android-widget';

import { DdayWidget } from './DdayWidget';
import type { WidgetEntry } from './widgetEntries';

/** 위젯 고르기 화면용 미리보기 이미지를 만들 때 쓰는 예시 데이터 */
const SAMPLE_ENTRIES: WidgetEntry[] = [
  {
    id: 'sample-1',
    title: '우리 처음 만난 날',
    color: 'rose',
    label: 'D-Day',
    dateText: '10.2 (금)',
    isToday: true,
    isPast: false,
  },
  {
    id: 'sample-2',
    title: '엄마 생신',
    color: 'terracotta',
    label: 'D-12',
    dateText: '10.14 (수)',
    isToday: false,
    isPast: false,
  },
  {
    id: 'sample-3',
    title: '자격증 시험',
    color: 'blue',
    label: 'D-30',
    dateText: '11.1 (일)',
    isToday: false,
    isPast: false,
  },
];

/** 4×2 위젯의 기본 크기(dp) */
const PREVIEW_WIDTH = 330;
const PREVIEW_HEIGHT = 186;

/** 개발 빌드 전용. 화면을 캡처해 assets/widget-preview.png를 만든다. */
export function WidgetPreviewScreen() {
  if (!__DEV__) return null;
  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityLabel="widget-preview-area"
        style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
      >
        <WidgetPreview
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
          renderWidget={() => (
            <DdayWidget entries={SAMPLE_ENTRIES} todayText="10.2 (금)" theme="light" />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // 개발 도구 버튼과 겹치지 않게 위쪽에 둔다. 캡처 후 모서리를 투명하게 다듬는다.
    paddingTop: 24,
    backgroundColor: '#808080',
  },
});
