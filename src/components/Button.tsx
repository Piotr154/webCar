import { Pressable, StyleSheet } from 'react-native';

import { CutCornerView } from '@/components/CutCornerView';
import { Heading } from '@/components/Typography';
import { colors } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'outline' | 'danger';
  cutCorner?: boolean;
};

const CUT = 10;
const BORDER = 1.5;

export function Button({
  label,
  onPress,
  variant = 'outline',
  cutCorner = false,
}: Props) {
  const danger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <CutCornerView
        cut={danger || cutCorner ? CUT : 0}
        fill={danger ? colors.danger : 'transparent'}
        stroke={danger ? undefined : colors.border}
        strokeWidth={danger ? 0 : BORDER}
        style={styles.box}
      >
        <Heading size={24} color={danger ? colors.onAccent : colors.text2}>
          {label}
        </Heading>
      </CutCornerView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  pressed: { opacity: 0.6 },
  box: { height: 52, alignItems: 'center', justifyContent: 'center' },
});
