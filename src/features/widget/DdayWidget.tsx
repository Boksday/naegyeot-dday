import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { colors } from '../../theme/tokens';
import type { WidgetEntry } from './widgetEntries';

type DdayWidgetProps = {
  entries: WidgetEntry[] | null;
};

function Message({ text }: { text: string }) {
  return <TextWidget text={text} style={{ fontSize: 14, color: colors.textMuted }} />;
}

/** entries가 null이면 데이터를 읽지 못한 상태다. */
export function DdayWidget({ entries }: DdayWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {entries === null ? (
        <Message text="앱을 열어 디데이를 확인해 주세요" />
      ) : entries.length === 0 ? (
        <Message text="디데이를 추가해 보세요" />
      ) : (
        entries.map((entry) => (
          <FlexWidget
            key={entry.id}
            style={{
              width: 'match_parent',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 4,
            }}
          >
            <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
              <TextWidget
                text={entry.title}
                maxLines={1}
                truncate="END"
                style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}
              />
              <TextWidget text={entry.dateText} style={{ fontSize: 12, color: colors.textMuted }} />
            </FlexWidget>
            <TextWidget
              text={entry.label}
              style={{ fontSize: 20, color: colors.primary, fontWeight: '700', marginLeft: 8 }}
            />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
