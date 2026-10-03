import * as Linking from 'expo-linking';
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
  /** 홈 위젯은 Pro 전용이다. 잠겨 있으면 디데이 대신 Pro 안내를 보여준다. */
  isLocked?: boolean;
};

/** 잠긴 위젯을 누르면 Pro 구매 영역이 있는 설정 화면을 연다. */
// 앱마다 스킴이 달라(개발용 앱은 -dev) 설정 값으로 주소를 만든다.
const PRO_SETTINGS_URI = Linking.createURL('settings');

const APP_LOGO = require('../../../assets/logo.png');
const LOGO_SIZE = 20;
const DOT_SIZE = 8;

export function paletteFor(theme: WidgetTheme): { colors: ThemeColors; palette: CategoryPalette } {
  return theme === 'dark'
    ? { colors: darkColors, palette: darkCategoryPalette }
    : { colors: lightColors, palette: lightCategoryPalette };
}

export function DdayWidget({ entries, todayText, theme, isLocked = false }: DdayWidgetProps) {
  const { colors, palette } = paletteFor(theme);

  return (
    <FlexWidget
      clickAction={isLocked ? 'OPEN_URI' : 'OPEN_APP'}
      clickActionData={isLocked ? { uri: PRO_SETTINGS_URI } : undefined}
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

      {isLocked ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text="홈 화면 위젯은 Pro 기능이에요"
            style={{ fontSize: 14, fontWeight: '700', color: colors.text }}
          />
          <TextWidget
            text="눌러서 알아보기"
            style={{ fontSize: 12, color: colors.primaryText, marginTop: 6 }}
          />
        </FlexWidget>
      ) : entries === null || entries.length === 0 ? (
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
