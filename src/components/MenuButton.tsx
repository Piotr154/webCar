import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { openMenu } from '@/navigation';
import { colors } from '@/theme';

// Otwiera menu (09) i podaje mu ścieżkę bieżącego ekranu.
export function MenuButton() {
  const pathname = usePathname();

  return (
    <Pressable
      onPress={() => openMenu(pathname)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Menu"
      style={({ pressed }) => [styles.box, pressed && styles.pressed]}
    >
      <View style={styles.bar} />
      <View style={styles.bar} />
      <View style={styles.bar} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  pressed: { opacity: 0.6 },
  bar: { width: 20, height: 3, backgroundColor: colors.text2 },
});
