import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function Heading({
  children,
  size = 34,
  color = colors.text,
  style,
}: Props) {
  return (
    <Text style={[styles.heading, { fontSize: size, color }, style]}>
      {children}
    </Text>
  );
}

export function Label({
  children,
  size = 12,
  color = colors.muted,
  style,
}: Props) {
  return (
    <Text style={[styles.label, { fontSize: size, color }, style]}>
      {children}
    </Text>
  );
}

export function Mono({
  children,
  size = 16,
  color = colors.text,
  style,
}: Props) {
  return (
    <Text style={[styles.mono, { fontSize: size, color }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.heading,
    textTransform: 'uppercase',
    transform: [{ skewX: '-10deg' }],
    paddingRight: 4,
  },
  label: {
    fontFamily: fonts.monoBold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: fonts.mono,
  },
});
