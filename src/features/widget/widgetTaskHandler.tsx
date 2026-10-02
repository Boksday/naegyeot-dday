import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { toLocalDate } from '../dday/logic/dates';
import { loadDdayData } from '../dday/storage/ddayRepository';
import { DdayWidget } from './DdayWidget';
import { buildWidgetEntries } from './widgetEntries';

export async function renderDdayWidget(): Promise<React.JSX.Element> {
  const result = await loadDdayData();
  const entries = result.ok ? buildWidgetEntries(result, toLocalDate(new Date())) : null;
  return <DdayWidget entries={entries} />;
}

export async function widgetTaskHandler({ widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;
  renderWidget(await renderDdayWidget());
}
