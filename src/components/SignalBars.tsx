import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

const SIZES = {
  small: { width: 5, heights: [9, 14, 19, 24] }, // Home
  large: { width: 6, heights: [10, 16, 22, 28] }, // ekran jazdy
};

type Props = {
  level: number; // 0–4: ile kresek jest zapalonych
  size?: keyof typeof SIZES;
  color?: string;
  offColor?: string;
};

export function SignalBars({
  level,
  size = 'small',
  color = colors.accent,
  offColor = colors.disabled,
}: Props) {
  const { width, heights } = SIZES[size];

  return (
    <View style={styles.row}>
      {heights.map((height, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { width, height, backgroundColor: i < level ? color : offColor },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { transform: [{ skewX: '-14deg' }] },
});
