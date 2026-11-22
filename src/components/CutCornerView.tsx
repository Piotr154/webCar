import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

type Props = {
  cut: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function CutCornerView({
  cut,
  fill = 'transparent',
  stroke,
  strokeWidth = 0,
  style,
  children,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width: w, height: h } = size;
  const s = strokeWidth / 2;
  const points = [
    `${s},${s}`,
    `${w - s},${s}`,
    `${w - s},${h - cut}`,
    `${w - cut},${h - s}`,
    `${s},${h - s}`,
  ].join(' ');

  return (
    <View
      style={style}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {w > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={w} height={h}>
          <Polygon
            points={points}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
