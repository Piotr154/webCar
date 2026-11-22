import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { CutCornerView } from '@/components/CutCornerView';
import { Heading } from '@/components/Typography';
import { colors } from '@/theme';

const SIZES = {
  large: {
    font: 44,
    cut: 18,
    paddingV: 28,
    paddingH: 26,
    arrow: { w: 18, h: 31, gap: 2 },
  },
  normal: {
    font: 28,
    cut: 14,
    paddingV: 22,
    paddingH: 24,
    arrow: { w: 12, h: 20, gap: 1 },
  },
};

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: keyof typeof SIZES;
  icon?: 'arrows' | 'horn'; // horn: TEST HORN (14)
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  size = 'normal',
  icon = 'arrows',
}: Props) {
  const s = SIZES[size];
  // Wyłączony (08A): ciemne tło, napis i strzałki przygaszone.
  const background = disabled ? colors.disabledBackground : colors.accent;
  const foreground = disabled ? colors.dim : colors.onAccent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <CutCornerView
        cut={s.cut}
        fill={background}
        style={[
          styles.box,
          { paddingVertical: s.paddingV, paddingHorizontal: s.paddingH },
        ]}
      >
        <Heading size={s.font} color={foreground} style={styles.label}>
          {label}
        </Heading>
        {icon === 'horn' ? (
          <HornIcon color={foreground} />
        ) : (
          <View style={[styles.arrows, { gap: s.arrow.gap }]}>
            <Chevron width={s.arrow.w} height={s.arrow.h} color={foreground} />
            <Chevron width={s.arrow.w} height={s.arrow.h} color={foreground} />
          </View>
        )}
      </CutCornerView>
    </Pressable>
  );
}

// Jedna strzałka „›” — ten sam kształt co clip-path w makiecie, w skali 0–100.
function Chevron({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <Polygon points="0,0 45,0 100,50 45,100 0,100 55,50" fill={color} />
    </Svg>
  );
}

// Ikona głośnika z makiety 14 (TEST HORN).
function HornIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 16 16">
      <Path
        d="M2 6h2.6L8 3.2v9.6L4.6 10H2z M10.4 6.1a2.6 2.6 0 0 1 0 3.8 M12.3 4.2a5.2 5.2 0 0 1 0 7.6"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { flexShrink: 1 },
  arrows: { flexDirection: 'row', alignItems: 'center' },
});
