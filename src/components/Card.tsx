import React from 'react';
import { View, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  margin = 0,
  elevation = 2,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          padding,
          margin,
          shadowOpacity: elevation * 0.02,
          elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
});