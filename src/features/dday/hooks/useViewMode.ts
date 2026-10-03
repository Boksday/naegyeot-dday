import { useCallback, useEffect, useState } from 'react';

import { loadViewMode, saveViewMode, type ViewMode } from '../listPreferences';

/** 목록·달력 보기. 앱을 다시 켜도 유지된다. */
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>('list');

  useEffect(() => {
    let isActive = true;
    loadViewMode()
      .then((loaded) => {
        if (isActive) setMode(loaded);
      })
      .catch((error: unknown) => console.warn('보기 설정을 읽지 못함', error));
    return () => {
      isActive = false;
    };
  }, []);

  const change = useCallback((next: ViewMode) => {
    setMode(next);
    saveViewMode(next).catch((error: unknown) => console.warn('보기 설정을 저장하지 못함', error));
  }, []);

  return [mode, change];
}
