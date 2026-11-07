import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  container: { flex: 1, backgroundColor: '#000000', padding: 22 },
  title: { color: '#f2f3f4', fontSize: 34, fontWeight: '700' },
  info: { color: '#9a9da2', fontSize: 13, marginTop: 4 },
  todo: {
    color: '#F0B429',
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  back: { marginTop: 'auto', paddingVertical: 14 },
  backText: { color: '#b9bbbe', fontSize: 16 },
});
