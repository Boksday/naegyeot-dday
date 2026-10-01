import { useLocalSearchParams } from 'expo-router';

import { DdayDetailScreen } from '../../features/dday/screens/DdayDetailScreen';

export default function DdayDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DdayDetailScreen id={id} />;
}
