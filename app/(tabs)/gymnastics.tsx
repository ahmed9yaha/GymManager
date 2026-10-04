// Powered by OnSpace.AI
import { SportScreen } from '@/components/feature/SportScreen';
import { Colors } from '@/constants/theme';

export default function GymnasticsScreen() {
  return (
    <SportScreen
      sport="gymnastics"
      label="جمباز"
      color={Colors.gymnastics}
      dimColor={Colors.gymnasticsDim}
      icon="sports-gymnastics"
    />
  );
}
