import { useLocalSearchParams } from 'expo-router';

import { DdayFormScreen } from '../features/dday/screens/DdayFormScreen';

export default function EditRoute() {
  const { id, category } = useLocalSearchParams<{ id?: string; category?: string }>();
  // 같은 화면이 다른 디데이로 재사용될 때 입력 상태가 섞이지 않도록 key로 초기화한다.
  return <DdayFormScreen key={id ?? 'new'} editingId={id} initialCategoryId={category} />;
}
