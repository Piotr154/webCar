import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Heading, Label, Mono } from '@/components/Typography';
import { colors, space } from '@/theme';

export default function DevScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Label style={styles.gap}>Heading 88</Label>
      <Heading size={88}>WebCar</Heading>
      <Label style={styles.gap}>Heading 34</Label>
      <Heading>Driver profiles</Heading>
      <Label style={styles.gap}>Heading 26 accent</Label>
      <Heading size={26} color={colors.accent}>
        45 %
      </Heading>
      <Label style={styles.gap}>Label</Label>
      <Label>Hello Karol</Label>
      <Label style={styles.gap}>Mono</Label>
      <Mono>24 MS · 04:12</Mono>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: space.l },
  gap: { marginTop: space.l },
});
