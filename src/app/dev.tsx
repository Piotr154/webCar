import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { InfoTile } from '@/components/InfoTile';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SignalBars } from '@/components/SignalBars';
import { Heading, Label, Mono } from '@/components/Typography';
import { resetDb } from '@/db/db';
import { useProfiles } from '@/state/ProfileContext';
import { colors, space } from '@/theme';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DevScreen() {
  const { profiles, activeProfile, activate, create } = useProfiles();
  const [dialog, setDialog] = useState<'delete' | 'noConnection' | null>(null);
  function activateNext() {
    if (profiles.length < 2) return;
    const i = profiles.findIndex((p) => p.id === activeProfile?.id);
    const next = profiles[(i + 1) % profiles.length];
    activate(next.id).catch((e) =>
      console.error('Nie udało się aktywować profilu', e),
    );
  }
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
            <View style={styles.connection}>
              <SignalBars level={4} />
              <Heading size={26}>ONLINE</Heading>
            </View>
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
        <Label style={styles.gap}>SignalBars (B6)</Label>
        <View style={styles.barsRow}>
          {[0, 1, 2, 3, 4].map((level) => (
            <SignalBars key={level} level={level} size="large" />
          ))}
          <SignalBars level={1} size="large" color={colors.danger} />
        </View>
        <View style={styles.barsRow}>
          {[0, 1, 2, 3, 4].map((level) => (
            <SignalBars key={level} level={level} />
          ))}
        </View>
        <Label style={styles.gap}>Button (B6)</Label>
        <View style={styles.buttonRow}>
          <Button label="Cancel" onPress={() => console.log('cancel')} />
          <Button
            label="Delete"
            variant="danger"
            onPress={() => console.log('delete')}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button label="Quit" onPress={() => console.log('quit')} />
          <Button
            label="Retry"
            variant="danger"
            onPress={() => console.log('retry')}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Close"
            cutCorner
            onPress={() => console.log('close')}
          />
        </View>
        <Label style={styles.gap}>PrimaryButton (B6)</Label>
        <View style={styles.stack}>
          <PrimaryButton
            label="Drive"
            size="large"
            onPress={() => console.log('drive')}
          />
          <PrimaryButton
            label="Drive"
            size="large"
            disabled
            onPress={() =>
              console.log('drive (wyłączony — nie powinno się pojawić)')
            }
          />
          <PrimaryButton
            label="Use this profile"
            onPress={() => console.log('use this profile')}
          />
          <PrimaryButton
            label="Test horn"
            icon="horn"
            onPress={() => console.log('test horn')}
          />
        </View>
        <Label style={styles.gap}>Dialog (B6)</Label>
        <View style={styles.buttonRow}>
          <Button label="11B" onPress={() => setDialog('delete')} />
          <Button label="19" onPress={() => setDialog('noConnection')} />
        </View>
        <Dialog visible={dialog === 'delete'} title="Delete Maja's profile?">
          <Button label="Cancel" onPress={() => setDialog(null)} />
          <Button
            label="Delete"
            variant="danger"
            onPress={() => setDialog(null)}
          />
        </Dialog>
        <Dialog
          visible={dialog === 'noConnection'}
          title="No connection"
          marker
        >
          <Button label="Close" cutCorner onPress={() => setDialog(null)} />
        </Dialog>
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
          <Mono>DODAJ PROFIL</Mono>
        </Pressable>
        <Pressable onPress={activateNext}>
          <Mono>AKTYWUJ NASTĘPNY PROFIL</Mono>
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
  stack: { gap: space.m, marginTop: space.s },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: space.s },
  connection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.l,
    marginTop: space.s,
  },
});
