import { router, useCanGoBack } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
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
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} />
      <View style={[styles.body, { paddingBottom: insets.bottom + space.l }]}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, paddingHorizontal: space.l },
  info: { color: colors.muted2, fontSize: 13 },
  todo: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  back: { marginTop: 'auto', paddingVertical: 14 },
  backText: { color: colors.muted, fontSize: 16 },
});
