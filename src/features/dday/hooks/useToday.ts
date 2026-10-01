import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { type LocalDate, toLocalDate } from '../logic/dates';

/** 앱이 다시 활성화될 때 날짜가 바뀌었으면 갱신한다. 자정을 넘겨 켜 둔 경우를 위해서다. */
export function useToday(): LocalDate {
  const [today, setToday] = useState(() => toLocalDate(new Date()));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toLocalDate(new Date()));
    });
    return () => subscription.remove();
  }, []);

  return today;
}
