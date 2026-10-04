// Powered by OnSpace.AI
import { SportScreen } from '@/components/feature/SportScreen';
import { Colors } from '@/constants/theme';

export default function KickboxingScreen() {
  return (
    <SportScreen
      sport="kickboxing"
      label="كيك بوكسينغ"
      color={Colors.kickboxing}
      dimColor={Colors.kickboxingDim}
      icon="sports-kabaddi"
    />
  );
}
