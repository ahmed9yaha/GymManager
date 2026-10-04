// Powered by OnSpace.AI
import { SportScreen } from '@/components/feature/SportScreen';
import { Colors } from '@/constants/theme';

export default function KarateScreen() {
  return (
    <SportScreen
      sport="karate"
      label="كاراتيه"
      color={Colors.karate}
      dimColor={Colors.karateDim}
      icon="sports-martial-arts"
    />
  );
}
