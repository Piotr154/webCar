import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { InfoTile } from '@/components/InfoTile';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SignalBars } from '@/components/SignalBars';
import { Heading, Label, Mono } from '@/components/Typography';
import { resetDb } from '@/db/db';
import type { ProfileChanges } from '@/db/profiles';
import { useProfiles } from '@/state/ProfileContext';
import { colors, space, underglowColors } from '@/theme';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCKUP_PROFILES: { name: string; changes: ProfileChanges }[] = [
  {
    name: 'KAROL',
    changes: {
      ledColor: underglowColors[0],
      powerLimit: 45,
      steering: 'STICK',
      camera: true,
      blinkers: true,
      autostopCm: 20,
      brightness: 60,
      horn: 3,
      volume: 22,
      radio: 1,
    },
  },
  { name: 'MAJA', changes: { ledColor: underglowColors[4] } },
  {
    name: 'DEMO / EXPO',
    changes: { ledColor: underglowColors[1], powerLimit: 25 },
  },
  {
    name: 'BENCH',
    changes: { ledColor: underglowColors[6], powerLimit: 100 },
  },
];

export default function DevScreen() {
  const { profiles, activeProfile, activate, create, update, reload } =
    useProfiles();
  const [dialog, setDialog] = useState<'delete' | 'noConnection' | null>(null);

  function activateNext() {
    if (profiles.length < 2) return;
    // getProfiles() stawia aktywny profil na początku, więc do przełączania
    // bierzemy stałą kolejność: od najstarszego (najmniejsze id).
    const ordered = [...profiles].sort((a, b) => a.id - b.id);
    const i = ordered.findIndex((p) => p.id === activeProfile?.id);
    const next = ordered[(i + 1) % ordered.length];
    activate(next.id).catch((e) =>
      console.error('Nie udało się aktywować profilu', e),
    );
  }

  async function addMockupProfiles() {
    let karolId: number | null = null;
    for (const mock of MOCKUP_PROFILES) {
      const existing = profiles.find((p) => p.name.toUpperCase() === mock.name);
      const id = existing ? existing.id : await create(mock.name);
      await update(id, mock.changes);
      if (mock.name === 'KAROL') karolId = id;
    }
    if (karolId !== null) await activate(karolId);
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
        <View style={styles.buttonRow}>
          <Button
            label="Reset bazy"
            variant="danger"
            onPress={() =>
              resetDb()
                .then(reload)
                .catch((e) => console.error('Reset bazy nie udał się', e))
            }
          />
        </View>
        <Label style={styles.gap}>Profile</Label>
        <View style={styles.buttonRow}>
          <Button
            label="+ Dodaj profil"
            onPress={() =>
              create(`TEST${profiles.length}`).catch((e) =>
                console.error('Nie udało się dodać profilu', e),
              )
            }
          />
        </View>
        <View style={styles.buttonRow}>
          <Button label="Aktywuj następny" onPress={activateNext} />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label="Profile z makiet"
            onPress={() =>
              addMockupProfiles().catch((e) =>
                console.error('Nie udało się dodać profili z makiet', e),
              )
            }
          />
        </View>
        {profiles.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => activate(p.id)}
            style={styles.profileItem}
          >
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
  profileItem: { paddingVertical: space.s },
  connection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.l,
    marginTop: space.s,
  },
});
