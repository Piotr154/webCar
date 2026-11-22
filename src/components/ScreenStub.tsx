import { router, useCanGoBack } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuButton } from '@/components/MenuButton';
import { colors, space } from '@/theme';

type Props = {
  title: string;
  mockup: string;
  owner: 'A' | 'B';
  children?: ReactNode;
};

const HIT_SLOP = 16;

export function ScreenStub({ title, mockup, owner, children }: Props) {
  const canGoBack = useCanGoBack();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <MenuButton />
      </View>
      <Text style={styles.info}>
        makieta {mockup} · moduł {owner}
      </Text>
      <Text style={styles.todo}>TODO</Text>
      {children}
      {canGoBack && (
        <Pressable
          style={styles.back}
          hitSlop={HIT_SLOP}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ WSTECZ</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: space.l },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.m,
  },
  title: { color: colors.text, fontSize: 34, fontWeight: '700', flexShrink: 1 },
  info: { color: colors.muted2, fontSize: 13, marginTop: 4 },
  todo: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  back: { marginTop: 'auto', paddingVertical: 14 },
  backText: { color: colors.muted, fontSize: 16 },
});
