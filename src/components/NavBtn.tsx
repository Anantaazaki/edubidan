import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface NavBtnProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
  isDark?: boolean;
}

export default function NavBtn({
  label,
  icon,
  iconFocused,
  focused,
  onPress,
  isDark = false,
}: NavBtnProps) {
  const activeColor = Colors.primary;
  const inactiveColor = isDark ? Colors.slate500 : Colors.slate400;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
    >
      <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
        <Ionicons
          name={focused ? iconFocused : icon}
          size={22}
          color={focused ? activeColor : inactiveColor}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: focused ? activeColor : inactiveColor },
          focused && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  iconWrapper: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: '700',
  },
});
