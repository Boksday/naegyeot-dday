import { Appearance } from 'react-native';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { toLocalDate } from '../dday/logic/dates';
import { loadDdayData } from '../dday/storage/ddayRepository';
import { loadCachedPro } from '../pro/proCache';
import { loadThemePreference } from '../settings/themePreference';
import { DdayWidget, type WidgetTheme } from './DdayWidget';
import { buildWidgetEntries, formatWidgetDate } from './widgetEntries';

/** 앱의 화면 모드 설정을 따른다. 시스템 설정 따르기면 기기 설정을 본다. */
async function resolveWidgetTheme(): Promise<WidgetTheme> {
  try {
    const preference = await loadThemePreference();
    if (preference !== 'system') return preference;
  } catch {
    // 설정을 못 읽으면 기기 설정을 따른다.
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export async function renderDdayWidget(): Promise<React.JSX.Element> {
  const today = toLocalDate(new Date());
  const [result, theme, isPro] = await Promise.all([
    loadDdayData(),
    resolveWidgetTheme(),
    loadCachedPro().catch(() => false),
  ]);
  const entries = result.ok ? buildWidgetEntries(result, today) : null;
  return (
    <DdayWidget
      entries={entries}
      todayText={formatWidgetDate(today)}
      theme={theme}
      isLocked={!isPro}
    />
  );
}

export async function widgetTaskHandler({ widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;
  renderWidget(await renderDdayWidget());
}
