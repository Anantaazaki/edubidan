import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  color,
}) => {
  const { theme } = useTheme();
  
  const primaryColor = color || Colors.primary;
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'secondary':
        return StyleSheet.flatten([...baseStyle, { backgroundColor: theme.surfaceSecondary }]);
      case 'outline':
        return StyleSheet.flatten([...baseStyle, { 
          backgroundColor: 'transparent', 
          borderWidth: 1.5, 
          borderColor: primaryColor 
        }]);
      case 'ghost':
        return StyleSheet.flatten([...baseStyle, { backgroundColor: 'transparent' }]);
      default:
        return StyleSheet.flatten(baseStyle);
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'secondary':
        return StyleSheet.flatten([...baseStyle, { color: theme.text }]);
      case 'outline':
        return StyleSheet.flatten([...baseStyle, { color: primaryColor }]);
      case 'ghost':
        return StyleSheet.flatten([...baseStyle, { color: primaryColor }]);
      default:
        return StyleSheet.flatten([...baseStyle, { color: Colors.white }]);
    }
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 14 : size === 'large' ? 18 : 16} 
          color={variant === 'primary' ? Colors.white : primaryColor}
          style={styles.iconLeft}
        />
      )}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.white : primaryColor} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 14 : size === 'large' ? 18 : 16} 
          color={variant === 'primary' ? Colors.white : primaryColor}
          style={styles.iconRight}
        />
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[getButtonStyle(), { opacity: isDisabled ? 0.6 : 1 }, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[primaryColor, `${primaryColor}CC`]}
          style={[styles.gradient, styles[size]]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[getButtonStyle(), { opacity: isDisabled ? 0.6 : 1 }, style]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 16,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});