import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space } from '@/theme';

type Props = {
  title: string;
  mockup: string;
  owner: 'A' | 'B';
  children?: ReactNode;
};

export function ScreenStub({ title, mockup, owner, children }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.info}>
        makieta {mockup} · moduł {owner}
      </Text>
      <Text style={styles.todo}>TODO</Text>
      {children}
      {router.canGoBack() && (
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ WSTECZ</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: space.l },
  title: { color: colors.text, fontSize: 34, fontWeight: '700' },
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
