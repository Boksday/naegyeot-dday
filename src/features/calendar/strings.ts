export const calendarStrings = {
  monthTitle: (year: number, month: number) => `${year}년 ${month}월`,
  previousMonth: '이전 달',
  nextMonth: '다음 달',
  today: '오늘',
  noEvents: '이날은 디데이가 없어요.',
  milestone: (dayCount: number) => `${dayCount.toLocaleString()}일`,
  more: (count: number) => `+${count}`,
  cellLabel: (date: string, count: number) => (count > 0 ? `${date}, 디데이 ${count}개` : date),
  viewList: '목록',
  viewCalendar: '달력',
} as const;
