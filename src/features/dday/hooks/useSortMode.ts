import { useCallback, useEffect, useState } from 'react';

import { loadSortMode, saveSortMode } from '../listPreferences';
import { DEFAULT_SORT_MODE, type SortMode } from '../logic/sorting';

/** 목록 정렬 방식. 앱을 다시 켜도 유지된다. */
export function useSortMode(): [SortMode, (mode: SortMode) => void] {
  const [mode, setMode] = useState<SortMode>(DEFAULT_SORT_MODE);

  useEffect(() => {
    let isActive = true;
    loadSortMode()
      .then((loaded) => {
        if (isActive) setMode(loaded);
      })
      .catch((error: unknown) => {
        // 못 읽으면 기본 정렬을 쓴다. 기록 데이터와 무관한 화면 설정이다.
        console.warn('정렬 설정을 읽지 못함', error);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const change = useCallback((next: SortMode) => {
    setMode(next);
    saveSortMode(next).catch((error: unknown) => {
      console.warn('정렬 설정을 저장하지 못함', error);
    });
  }, []);

  return [mode, change];
}
