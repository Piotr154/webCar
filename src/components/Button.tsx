import { Pressable, StyleSheet } from 'react-native';

import { CutCornerView } from '@/components/CutCornerView';
import { Heading } from '@/components/Typography';
import { colors } from '@/theme';

const CUT = 10;

const VARIANTS = {
  outline: {
    fill: undefined,
    stroke: colors.border,
    strokeWidth: 1.5,
    text: colors.text2,
    cut: 0,
  },
  danger: {
    fill: colors.danger,
    stroke: undefined,
    strokeWidth: 0,
    text: colors.onAccent,
    cut: CUT,
  },
};

type Props = {
  label: string;
  onPress: () => void;
  variant?: keyof typeof VARIANTS;
  cutCorner?: boolean; // ścięty róg w wariancie outline — CLOSE z 19
};

export function Button({
  label,
  onPress,
  variant = 'outline',
  cutCorner = false,
}: Props) {
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <CutCornerView
        cut={cutCorner ? CUT : v.cut}
        fill={v.fill}
        stroke={v.stroke}
        strokeWidth={v.strokeWidth}
        style={styles.box}
      >
        <Heading size={24} color={v.text}>
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
