import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LightTheme, DarkTheme } from '../constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  style?: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#00A78E',
  height = 8,
  showPercentage = false,
  animated = true,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;
  
  const percentage = Math.round(progress * 100);
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: theme.border, height }]}>
        <LinearGradient
          colors={[color, `${color}CC`]}
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              height,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, { color: theme.textMuted }]}>
          {percentage}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
});