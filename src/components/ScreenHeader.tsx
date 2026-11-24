import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuButton } from '@/components/MenuButton';
import { Heading, Label } from '@/components/Typography';
import { colors, space } from '@/theme';

type Props = {
  title: string;
};

export function ScreenHeader({ title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top + space.xl }]}>
      <View style={styles.bar} />
      <View style={styles.texts}>
        <Label color={colors.accent} style={styles.brand}>
          WebCar
        </Label>
        <Heading>{title}</Heading>
      </View>
      <View style={styles.menu}>
        <MenuButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.l,
    paddingBottom: space.l,
  },
  bar: {
    width: 6,
    height: 46,
    backgroundColor: colors.accent,
    transform: [{ skewX: '-12deg' }],
  },
  texts: { flex: 1 },
  brand: { letterSpacing: 2.4, lineHeight: 12 },
  // Przycisk przy górnej krawędzi wiersza, a nie wyśrodkowany: dwulinijkowy tytuł
  // jest wyższy niż 48, a przycisk ma stać tam, gdzie na Home i w menu.
  menu: { alignSelf: 'flex-start' },
});
