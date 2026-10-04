// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Member, getMemberStatus, formatDate } from '@/services/storage';
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme';

interface MemberCardProps {
  member: Member;
  sportColor: string;
  onDelete: (id: string) => void;
}

export const MemberCard = memo(({ member, sportColor, onDelete }: MemberCardProps) => {
  const status = getMemberStatus(member.endDate);

  const statusConfig = {
    active: { color: Colors.success, label: 'نشط', icon: 'check-circle' as const },
    expiring: { color: Colors.warning, label: 'ينتهي قريباً', icon: 'warning' as const },
    expired: { color: Colors.danger, label: 'منتهي', icon: 'cancel' as const },
  };

  const { color: statusColor, label: statusLabel, icon: statusIcon } = statusConfig[status];

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: sportColor }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          {/* Avatar */}
          <View style={[styles.avatarWrap, { borderColor: sportColor + '60' }]}>
            {member.photo ? (
              <Image
                source={{ uri: member.photo }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: sportColor + '20' }]}>
                <MaterialIcons name="person" size={22} color={sportColor} />
              </View>
            )}
          </View>

          {/* Name & Status */}
          <View style={styles.nameSection}>
            <Text style={styles.name}>{member.name}</Text>
            <View style={styles.statusBadge}>
              <MaterialIcons name={statusIcon} size={12} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            {member.phone ? (
              <View style={styles.phoneRow}>
                <MaterialIcons name="phone" size={12} color={Colors.textMuted} />
                <Text style={styles.phoneText}>{member.phone}</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
            onPress={() => onDelete(member.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
          </Pressable>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="attach-money" size={14} color={Colors.textMuted} />
            <Text style={styles.infoText}>{member.fee.toLocaleString('ar-SA')} ر.ي</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="calendar-today" size={14} color={Colors.textMuted} />
            <Text style={styles.infoText}>{formatDate(member.startDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={14} color={statusColor} />
            <Text style={[styles.infoText, { color: statusColor }]}>{formatDate(member.endDate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  phoneText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
