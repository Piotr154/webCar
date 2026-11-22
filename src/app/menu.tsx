import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heading, Mono } from '@/components/Typography';
import { navigateFromMenu } from '@/navigation';
import { colors, overlay, space } from '@/theme';

// Pozycje menu. A użyje tej listy w menu na ekranie jazdy (07).
export const MENU_ITEMS: { href: Href; label: string }[] = [
  { href: '/', label: 'HOME' },
  { href: '/drive-settings', label: 'DRIVE SETTINGS' },
  { href: '/profiles', label: 'DRIVER PROFILES' },
  { href: '/radio', label: 'RADIO' },
  { href: '/light-sound', label: 'LIGHT & SOUND' },
  { href: '/telemetry', label: 'TELEMETRY' },
];

const PANEL_WIDTH = 318;

export default function MenuScreen() {
  // Ścieżka ekranu, z którego otwarto menu (openMenu w src/navigation.ts).
  const { from } = useLocalSearchParams<{ from?: string }>();
  const insets = useSafeAreaInsets();

  function select(href: Href) {
    // Bieżący ekran: tylko zamykamy menu, bez ponownego otwierania tego samego ekranu.
    if (href === from) {
      router.back();
    } else {
      navigateFromMenu(href);
    }
  }

  return (
    <View style={styles.root}>
      {/* Przyciemniony pasek poprzedniego ekranu — dotknięcie zamyka menu. */}
      <Pressable
        style={styles.backdrop}
        onPress={() => router.back()}
        accessibilityLabel="Zamknij menu"
      />
      <View style={[styles.panel, { paddingTop: insets.top + space.xl }]}>
        <View style={styles.header}>
          <View style={styles.bar} />
          <Heading size={38} style={styles.brand}>
            WebCar
          </Heading>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Zamknij menu"
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <Mono size={20} color={colors.text2}>
              ✕
            </Mono>
          </Pressable>
        </View>
        <View style={styles.items}>
          {MENU_ITEMS.map((item) => {
            const current = item.href === from;
            return (
              <Pressable
                key={item.label}
                onPress={() => select(item.href)}
                accessibilityRole="button"
                accessibilityState={{ selected: current }}
                style={({ pressed }) => [
                  styles.item,
                  current && styles.itemCurrent,
                  pressed && styles.pressed,
                ]}
              >
                <Heading
                  size={24}
                  color={current ? colors.accent : colors.text2}
                >
                  {item.label}
                </Heading>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: overlay },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: colors.background,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.segmentOff,
  },
  header: {
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
  brand: { flex: 1 },
  close: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  items: { paddingHorizontal: space.l, gap: space.s },
  item: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.borderSoft,
    padding: 16,
  },
  itemCurrent: {
    backgroundColor: colors.accentTint,
    borderLeftColor: colors.accent,
  },
  pressed: { opacity: 0.6 },
});
