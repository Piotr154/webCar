import { InfoTile } from '@/components/InfoTile';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Heading, Label, Mono } from '@/components/Typography';
import { resetDb } from '@/db/db';
import { useProfiles } from '@/state/ProfileContext';
import { colors, space } from '@/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DevScreen() {
  const { profiles, activeProfile, activate, create } = useProfiles();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Label>ScreenHeader (B6)</Label>
        <ScreenHeader title="Drive settings" />
        <ScreenHeader title="Driver profiles" />
        <Label style={styles.gap}>InfoTile (B6)</Label>
        <View style={styles.tileRow}>
          <InfoTile label="Driver" style={styles.tile}>
            KAROL
          </InfoTile>
          <InfoTile label="Connection" style={styles.tile}>
            ONLINE
          </InfoTile>
        </View>
        <View style={styles.tileRow}>
          <InfoTile label="Steering" style={styles.tile}>
            STICK
          </InfoTile>
          <InfoTile
            label="Power limit"
            valueColor={colors.accent}
            style={styles.tile}
          >
            45%
          </InfoTile>
        </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.l },
  gap: { marginTop: space.l },
  tileRow: { flexDirection: 'row', gap: space.s, marginTop: space.s },
  tile: { flex: 1 },
});
