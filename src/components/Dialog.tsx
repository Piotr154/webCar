import type { ReactNode } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { Heading } from '@/components/Typography';
import { colors, overlay } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  marker?: boolean; // czerwony kwadracik przed tytułem — tylko błędy połączenia (06, 19)
  titleSize?: number; // 32 na ekranach pionowych, 34 na ekranie jazdy (06)
  children: ReactNode; // przyciski (Button), układane w wierszu
};

// Okienko z makiet 06, 11B, 16 i 19. Nie zamyka się po dotknięciu tła —
// CONNECTION LOST musi zostać, dopóki łącze nie wróci albo kierowca nie wybierze QUIT.
export function Dialog({
  visible,
  title,
  marker = false,
  titleSize = 32,
  children,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Bez tego okienko na poziomym ekranie jazdy (06) może się źle zachować.
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.titleRow}>
            {marker && <View style={styles.marker} />}
            <Heading size={titleSize} style={styles.title}>
              {title}
            </Heading>
          </View>
          <View style={styles.actions}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  panel: {
    width: '100%',
    maxWidth: 420, // szerokość okienka na poziomym ekranie jazdy (06)
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  marker: { width: 13, height: 13, backgroundColor: colors.danger },
  title: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
