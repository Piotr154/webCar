import { ScreenStub } from '@/components/ScreenStub';
import { colors } from '@/theme';
import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

const SCREENS = [
  { href: '/drive', label: 'DRIVE' },
  { href: '/menu', label: 'MENU' },
  { href: '/profiles', label: 'DRIVER PROFILES' },
  { href: '/drive-settings', label: 'DRIVE SETTINGS' },
  { href: '/light-sound', label: 'LIGHT & SOUND' },
  { href: '/radio', label: 'RADIO' },
  { href: '/telemetry', label: 'TELEMETRY' },
  { href: '/dev', label: 'DEV' },
] as const;

export default function HomeScreen() {
  return (
    <ScreenStub title="WEBCAR — HOME" mockup="08, 08A" owner="B">
      {SCREENS.map((s) => (
        <Link key={s.href} href={s.href} style={styles.link}>
          {s.label} ›
        </Link>
      ))}
      <Text style={styles.note}>
        Tymczasowa lista ekranów do testów nawigacji.
      </Text>
    </ScreenStub>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.text, fontSize: 18, paddingVertical: 10 },
  note: { color: colors.muted3, fontSize: 12, marginTop: 12 },
});
