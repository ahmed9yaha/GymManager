// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme';

interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  dimColor: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export const StatsCard = memo(({ label, value, color, dimColor, iconName, onPress }: StatsCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: dimColor, borderColor: color + '40' },
        onPress && pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '25' }]}>
        <MaterialIcons name={iconName} size={22} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {onPress ? (
        <View style={[styles.tapHint, { backgroundColor: color + '20' }]}>
          <MaterialIcons name="chevron-left" size={12} color={color} />
          <Text style={[styles.tapHintText, { color }]}>عرض</Text>
        </View>
      ) : null}
    </Pressable>
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
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
    gap: 1,
  },
  tapHintText: {
    fontSize: 9,
    fontWeight: '700',
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
