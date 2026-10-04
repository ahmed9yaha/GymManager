// Powered by OnSpace.AI
import { SportScreen } from '@/components/feature/SportScreen';
import { Colors } from '@/constants/theme';

export default function BoxingScreen() {
  return (
    <SportScreen
      sport="boxing"
      label="ملاكمة"
      color={Colors.boxing}
      dimColor={Colors.boxingDim}
      icon="sports-mma"
    />
  );
}
