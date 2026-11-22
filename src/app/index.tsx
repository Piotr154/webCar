import { Link, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuButton } from '@/components/MenuButton';
import { Heading, Label } from '@/components/Typography';
import { openMenu } from '@/navigation';
import { useProfiles } from '@/state/ProfileContext';
import { colors, space } from '@/theme';

const SCREENS: { href: Href; label: string }[] = [
  { href: '/drive', label: 'DRIVE' },
  { href: '/dev', label: 'DEV' },
];

export default function HomeScreen() {
  const { activeProfile } = useProfiles();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.xl }]}>
      <View style={styles.topRow}>
        <Label size={16} color={colors.muted2} style={styles.hello}>
          Hello {activeProfile?.name ?? ''}
        </Label>
        <MenuButton onPress={() => openMenu('/')} />
      </View>

      <View style={styles.logoRow}>
        <View style={styles.logoBar} />
        <Heading size={95} style={styles.logo}>
          WebCar
        </Heading>
      </View>

      {SCREENS.map((s) => (
        <Link key={s.label} href={s.href} style={styles.link}>
          {s.label} ›
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.l,
  },
  hello: { letterSpacing: 3.2 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingTop: 34,
    paddingHorizontal: space.l,
  },
  logoBar: {
    width: 8,
    height: 74,
    backgroundColor: colors.accent,
    transform: [{ skewX: '-12deg' }],
  },
  logo: { letterSpacing: -0.88 },
  link: {
    color: colors.text,
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: space.l,
  },
});
