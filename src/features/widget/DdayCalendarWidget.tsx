import * as Linking from 'expo-linking';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

import type { MonthCell } from '../calendar/calendarEvents';
import type { CategoryColorKey } from '../../theme/tokens';
import { paletteFor, type WidgetTheme } from './DdayWidget';

export const CALENDAR_WIDGET_NAME = 'DdayCalendarWidget';

export type CalendarWidgetLabel = { text: string; color: CategoryColorKey };
export type CalendarWidgetCell = MonthCell & { labels: CalendarWidgetLabel[] };

type DdayCalendarWidgetProps = {
  title: string;
  cells: CalendarWidgetCell[];
  today: string;
  theme: WidgetTheme;
  isLocked: boolean;
};

const APP_LOGO = require('../../../assets/logo.png');
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
// 앱마다 스킴이 달라(개발용 앱은 -dev) 설정 값으로 주소를 만든다.
const PRO_SETTINGS_URI = Linking.createURL('settings');

/** 이번 달 달력 위젯(Pro). 칸마다 첫 일정 이름과 남은 개수(+n)를 보여준다. */
export function DdayCalendarWidget({
  title,
  cells,
  today,
  theme,
  isLocked,
}: DdayCalendarWidgetProps) {
  const { colors, palette } = paletteFor(theme);
  const weeks = Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7));

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
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 10,
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <ImageWidget image={APP_LOGO} imageWidth={18} imageHeight={18} radius={5} />
        <TextWidget
          text={title}
          style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginLeft: 6 }}
        />
      </FlexWidget>

      {isLocked ? (
        <FlexWidget
          style={{ width: 'match_parent', flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <TextWidget
            text="달력 위젯은 Pro 기능이에요"
            style={{ fontSize: 14, fontWeight: '700', color: colors.text }}
          />
          <TextWidget
            text="눌러서 알아보기"
            style={{ fontSize: 12, color: colors.primaryText, marginTop: 6 }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'column' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row' }}>
            {WEEKDAYS.map((weekday, index) => (
              <FlexWidget key={weekday} style={{ flex: 1, alignItems: 'center' }}>
                <TextWidget
                  text={weekday}
                  style={{
                    fontSize: 10,
                    color:
                      index === 0
                        ? palette.rose.text
                        : index === 6
                          ? palette.blue.text
                          : colors.textMuted,
                  }}
                />
              </FlexWidget>
            ))}
          </FlexWidget>
          {weeks.map((week, weekIndex) => (
            <FlexWidget
              key={weekIndex}
              style={{ width: 'match_parent', flex: 1, flexDirection: 'row' }}
            >
              {week.map((cell, index) => {
                const isToday = cell.date === today;
                const baseColor =
                  index === 0 ? palette.rose.text : index === 6 ? palette.blue.text : colors.text;
                return (
                  <FlexWidget
                    key={cell.date}
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingHorizontal: 1,
                    }}
                  >
                    <FlexWidget
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday ? colors.primarySoft : '#00000000',
                      }}
                    >
                      <TextWidget
                        text={String(Number(cell.date.slice(8, 10)))}
                        style={{
                          fontSize: 11,
                          fontWeight: isToday ? '800' : 'normal',
                          color: isToday
                            ? colors.primaryText
                            : cell.isCurrentMonth
                              ? baseColor
                              : colors.border,
                        }}
                      />
                    </FlexWidget>
                    {cell.labels[0] && (
                      <FlexWidget
                        style={{
                          width: 'match_parent',
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 1,
                        }}
                      >
                        <FlexWidget
                          style={{
                            flex: 1,
                            backgroundColor: palette[cell.labels[0].color].soft,
                            borderRadius: 3,
                            paddingHorizontal: 2,
                          }}
                        >
                          <TextWidget
                            text={cell.labels[0].text}
                            maxLines={1}
                            truncate="END"
                            style={{
                              fontSize: 8,
                              fontWeight: '600',
                              color: palette[cell.labels[0].color].text,
                            }}
                          />
                        </FlexWidget>
                        {cell.labels.length > 1 && (
                          <TextWidget
                            text={`+${cell.labels.length - 1}`}
                            style={{ fontSize: 8, color: colors.textMuted, marginLeft: 1 }}
                          />
                        )}
                      </FlexWidget>
                    )}
                  </FlexWidget>
                );
              })}
            </FlexWidget>
          ))}
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
