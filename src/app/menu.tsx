import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ScreenStub } from '@/components/ScreenStub';
import { navigateFromMenu } from '@/navigation';
import { colors } from '@/theme';

export const MENU_ITEMS: { href: Href; label: string }[] = [
  { href: '/', label: 'HOME' },
  { href: '/drive-settings', label: 'DRIVE SETTINGS' },
  { href: '/profiles', label: 'DRIVER PROFILES' },
  { href: '/radio', label: 'RADIO' },
  { href: '/light-sound', label: 'LIGHT & SOUND' },
  { href: '/telemetry', label: 'TELEMETRY' },
];

export default function MenuScreen() {
  return (
    <ScreenStub title="MENU" mockup="09" owner="B" hideMenuButton>
      {MENU_ITEMS.map((item) => (
        <Pressable key={item.label} onPress={() => navigateFromMenu(item.href)}>
          <Text style={styles.item}>{item.label} ›</Text>
        </Pressable>
      ))}
    </ScreenStub>
  );
}

const styles = StyleSheet.create({
  item: { color: colors.text, fontSize: 18, paddingVertical: 10 },
});
