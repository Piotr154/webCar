import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Heading, Label } from '@/components/Typography';
import { colors, space } from '@/theme';

type Props = {
  label: string;
  children: ReactNode;
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function InfoTile({ label, children, valueColor, style }: Props) {
  const isText = typeof children === 'string' || typeof children === 'number';

  return (
    <View style={[styles.tile, style]}>
      <Label style={styles.label}>{label}</Label>
      <View style={styles.value}>
        {isText ? (
          <Heading size={26} color={valueColor}>
            {children}
          </Heading>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.borderSoft,
    paddingTop: space.m,
    paddingHorizontal: space.m,
    paddingBottom: 16,
  },
  label: { letterSpacing: 1.92 },
  value: { marginTop: 10 },
});
