import { CutCornerView } from '@/components/CutCornerView';
import { InfoTile } from '@/components/InfoTile';
import { MenuButton } from '@/components/MenuButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SignalBars } from '@/components/SignalBars';
import { Heading, Label } from '@/components/Typography';
import { openMenu } from '@/navigation';
import { useProfiles } from '@/state/ProfileContext';
import { colors, space } from '@/theme';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { activeProfile } = useProfiles();
  const insets = useSafeAreaInsets();
  // TODO(A5): zamienić na const connection = useConnection();
  const connection: { status: 'online' | 'offline'; bars: number } = {
    status: 'offline',
    bars: 0,
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.xl }]}>
      <View style={styles.topRow}>
        <Label size={16} color={colors.muted2} style={styles.hello}>
          Hello {activeProfile?.name ?? ''}
        </Label>
        <MenuButton onPress={() => openMenu('/')} />
      </View>

      {/* Przytrzymanie WEBCAR otwiera /dev — tylko podczas pracy z Metro (__DEV__). */}
      <Pressable
        style={styles.logoRow}
        onLongPress={__DEV__ ? () => router.push('/dev') : undefined}
      >
        <View style={styles.logoBar} />
        <Heading size={88} style={styles.logo}>
          WebCar
        </Heading>
      </Pressable>

      <CutCornerView cut={22} fill={colors.surfaceLow} style={styles.car} />

      <View style={styles.tiles}>
        <View style={styles.tileRow}>
          <InfoTile label="Driver" style={styles.tile}>
            {activeProfile?.name ?? ''}
          </InfoTile>
          <InfoTile label="Connection" style={styles.tile}>
            <View style={styles.connection}>
              {connection.status === 'online' ? (
                <SignalBars level={connection.bars} />
              ) : (
                <OfflineMark />
              )}
              <Heading size={26}>
                {connection.status === 'online' ? 'Online' : 'Offline'}
              </Heading>
            </View>
          </InfoTile>
        </View>
        <View style={styles.tileRow}>
          <InfoTile label="Steering" style={styles.tile}>
            {activeProfile?.steering ?? ''}
          </InfoTile>
          <InfoTile
            label="Power limit"
            valueColor={colors.accent}
            style={styles.tile}
          >
            {activeProfile ? `${activeProfile.powerLimit}%` : ''}
          </InfoTile>
        </View>
      </View>

      <View
        style={[
          styles.driveWrap,
          { paddingBottom: Math.max(insets.bottom, space.xl) },
        ]}
      >
        <PrimaryButton
          label="Drive"
          size="large"
          disabled={connection.status !== 'online'}
          onPress={() => router.push('/drive')}
        />
      </View>
    </View>
  );
}

// Czerwony ✕ z makiety 08A: dwa paski 5×28 obrócone o ±45°.
function OfflineMark() {
  return (
    <View style={styles.offline}>
      <View style={[styles.offlineBar, { transform: [{ rotate: '45deg' }] }]} />
      <View
        style={[styles.offlineBar, { transform: [{ rotate: '-45deg' }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.l,
  },
  hello: { letterSpacing: 3.2 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingTop: 34,
    paddingHorizontal: space.l,
  },
  logoBar: {
    width: 8,
    height: 74,
    backgroundColor: colors.accent,
    transform: [{ skewX: '-12deg' }],
  },
  // Ujemny margines: Heading 88 bez lineHeight ma wysoki wiersz z pustym miejscem
  // nad i pod literami — zmniejszamy miejsce w układzie, litery zostają całe.
  logo: { letterSpacing: -0.88, marginVertical: -28 },
  // Prostokąt na rysunek auta: zajmuje miejsce, które zostało, najwyżej 250 (makieta).
  car: {
    flex: 1,
    maxHeight: 250,
    marginTop: 26,
    marginHorizontal: space.l,
  },
  tiles: { paddingTop: 18, paddingHorizontal: space.l, gap: space.s },
  tileRow: { flexDirection: 'row', gap: space.s },
  tile: { flex: 1 },
  connection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  offline: { width: 24, height: 24 },
  offlineBar: {
    position: 'absolute',
    left: 9.5,
    top: -2,
    width: 5,
    height: 28,
    backgroundColor: colors.danger,
  },
  driveWrap: { marginTop: 'auto', paddingTop: 18, paddingHorizontal: space.l },
});
