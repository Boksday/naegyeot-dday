import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { toLocalDate } from '../dday/logic/dates';
import { loadDdays } from '../dday/storage/ddayRepository';
import { DdayWidget } from './DdayWidget';
import { buildWidgetEntries } from './widgetEntries';

export async function renderDdayWidget(): Promise<React.JSX.Element> {
  const result = await loadDdays();
  const entries = result.ok ? buildWidgetEntries(result.items, toLocalDate(new Date())) : null;
  return <DdayWidget entries={entries} />;
}

export async function widgetTaskHandler({ widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;
  renderWidget(await renderDdayWidget());
}
