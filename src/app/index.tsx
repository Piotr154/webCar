import { Link, type Href } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ScreenStub } from '@/components/ScreenStub';
import { colors } from '@/theme';

const SCREENS: { href: Href; label: string }[] = [
  { href: '/drive', label: 'DRIVE' },
  { href: '/dev', label: 'DEV' },
];

export default function HomeScreen() {
  return (
    <ScreenStub title="WEBCAR" mockup="08, 08A" owner="B">
      {SCREENS.map((s) => (
        <Link key={s.label} href={s.href} style={styles.link}>
          {s.label} ›
        </Link>
      ))}
      <Text style={styles.note}>
        Tymczasowe linki. Pozostałe ekrany są w MENU.
      </Text>
    </ScreenStub>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.text, fontSize: 18, paddingVertical: 10 },
  note: { color: colors.muted3, fontSize: 12, marginTop: 12 },
});
