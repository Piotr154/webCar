import { usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MenuButton } from '@/components/MenuButton';
import { Heading, Label } from '@/components/Typography';
import { openMenu } from '@/navigation';
import { colors, space } from '@/theme';

type Props = {
  title: string;
};

export function ScreenHeader({ title }: Props) {
  const pathname = usePathname();

  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <View style={styles.texts}>
        <Label color={colors.accent} style={styles.brand}>
          WebCar
        </Label>
        <Heading>{title}</Heading>
      </View>
      <MenuButton onPress={() => openMenu(pathname)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingTop: space.xl,
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
});
