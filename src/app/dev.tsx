import { MenuButton } from '@/components/MenuButton';
import { Heading, Label, Mono } from '@/components/Typography';
import { resetDb } from '@/db/db';
import { useProfiles } from '@/state/ProfileContext';
import { colors, space } from '@/theme';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DevScreen() {
  const { profiles, activeProfile, activate, create } = useProfiles();

  return (
    <SafeAreaView style={styles.container}>
      <Label>MenuButton (B6)</Label>
      <MenuButton onPress={() => console.log('menu')} />
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
      <Label style={styles.gap}>Baza</Label>
      <Pressable
        onPress={() =>
          resetDb()
            .then(() =>
              console.log('Baza zresetowana — przeładuj aplikację (r)'),
            )
            .catch((e) => console.error('Reset bazy nie udał się', e))
        }
      >
        <Mono color={colors.danger}>RESET BAZY</Mono>
      </Pressable>
      <Label style={styles.gap}>Profile (test B5)</Label>
      <Pressable onPress={() => create(`TEST${profiles.length}`)}>
        <Mono>+ DODAJ PROFIL</Mono>
      </Pressable>
      {profiles.map((p) => (
        <Pressable key={p.id} onPress={() => activate(p.id)}>
          <Mono>
            {p.id === activeProfile?.id ? '● ' : '○ '}
            {p.name}
          </Mono>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: space.l },
  gap: { marginTop: space.l },
});
