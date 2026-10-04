// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme';

interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  dimColor: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
}

export const StatsCard = memo(({ label, value, color, dimColor, iconName }: StatsCardProps) => {
  return (
    <View style={[styles.card, { backgroundColor: dimColor, borderColor: color + '40' }]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '25' }]}>
        <MaterialIcons name={iconName} size={22} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: Spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
