import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

import {
  type CategoryPalette,
  darkCategoryPalette,
  darkColors,
  lightCategoryPalette,
  lightColors,
  type ThemeColors,
} from '../../theme/tokens';
import type { WidgetEntry } from './widgetEntries';

export type WidgetTheme = 'light' | 'dark';

type DdayWidgetProps = {
  /** null이면 데이터를 읽지 못한 상태다. */
  entries: WidgetEntry[] | null;
  todayText: string;
  theme: WidgetTheme;
};

const APP_LOGO = require('../../../assets/logo.png');
const LOGO_SIZE = 20;
const DOT_SIZE = 8;

function paletteFor(theme: WidgetTheme): { colors: ThemeColors; palette: CategoryPalette } {
  return theme === 'dark'
    ? { colors: darkColors, palette: darkCategoryPalette }
    : { colors: lightColors, palette: lightCategoryPalette };
}

export function DdayWidget({ entries, todayText, theme }: DdayWidgetProps) {
  const { colors, palette } = paletteFor(theme);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: theme === 'dark' ? colors.surface : colors.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <ImageWidget image={APP_LOGO} imageWidth={LOGO_SIZE} imageHeight={LOGO_SIZE} radius={6} />
        <TextWidget
          text="내곁의 디데이"
          style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginLeft: 6 }}
        />
        <FlexWidget style={{ flex: 1 }} />
        <TextWidget text={todayText} style={{ fontSize: 11, color: colors.textMuted }} />
      </FlexWidget>

      {entries === null || entries.length === 0 ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text={
              entries === null ? '앱을 열어 디데이를 확인해 주세요' : '소중한 날을 추가해 보세요'
            }
            style={{ fontSize: 14, fontWeight: '600', color: colors.text }}
          />
          {entries !== null && (
            <TextWidget
              text="눌러서 첫 디데이 만들기"
              style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}
            />
          )}
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            width: 'match_parent',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}
        >
          {entries.map((entry) => {
            const colorSet = palette[entry.color];
            const pillBackground = entry.isToday
              ? colorSet.dot
              : entry.isPast
                ? colors.surfaceMuted
                : colorSet.soft;
            const pillText = entry.isToday
              ? colors.onPastel
              : entry.isPast
                ? colors.textMuted
                : colorSet.text;
            return (
              <FlexWidget
                key={entry.id}
                style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center' }}
              >
                <FlexWidget
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: DOT_SIZE / 2,
                    backgroundColor: colorSet.dot,
                    marginRight: 10,
                  }}
                />
                <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
                  <TextWidget
                    text={entry.title}
                    maxLines={1}
                    truncate="END"
                    style={{ fontSize: 14, fontWeight: '600', color: colors.text }}
                  />
                  <TextWidget
                    text={entry.dateText}
                    style={{ fontSize: 11, color: colors.textMuted }}
                  />
                </FlexWidget>
                <FlexWidget
                  style={{
                    backgroundColor: pillBackground,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginLeft: 8,
                  }}
                >
                  <TextWidget
                    text={entry.label}
                    style={{ fontSize: 14, fontWeight: '800', color: pillText }}
                  />
                </FlexWidget>
              </FlexWidget>
            );
          })}
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
