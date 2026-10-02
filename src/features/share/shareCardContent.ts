import { formatKoreanDate, type LocalDate } from '../dday/logic/dates';
import { formatDdayLabel, getDayCount, getDdayStatus } from '../dday/logic/ddayStatus';
import { formatLunarDate } from '../dday/logic/lunar';
import type { Dday } from '../dday/types';

export type ShareCardContent = {
  title: string;
  headline: string;
  caption: string;
};

/** 공유 카드 문구. 다가오는 날은 남은 날, 지난 날은 함께한 날(기준일 1일째)을 크게 보여준다. */
export function buildShareCardContent(item: Dday, today: LocalDate): ShareCardContent {
  const status = getDdayStatus(item, today);
  const lunarSuffix = item.lunar ? ` · ${formatLunarDate(item.lunar)}` : '';

  if (status.daysUntil === 0) {
    return { title: item.title, headline: 'D-Day', caption: '오늘이에요!' };
  }
  if (status.daysUntil > 0) {
    return {
      title: item.title,
      headline: formatDdayLabel(status.daysUntil),
      caption: `${formatKoreanDate(status.targetDate)}${lunarSuffix}`,
    };
  }
  const dayCount = getDayCount(item.date, today) ?? 0;
  return {
    title: item.title,
    headline: `${dayCount.toLocaleString()}일째`,
    caption: `${formatKoreanDate(item.date)}부터`,
  };
}
