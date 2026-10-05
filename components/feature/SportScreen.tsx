
// Powered by OnSpace.AI
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { StatsCard } from './StatsCard';
import { MemberCard } from './MemberCard';
import { AddMemberModal } from './AddMemberModal';
import { SportKey } from '@/services/storage';
import { useAlert } from '@/template';

interface SportScreenProps {
  sport: SportKey;
  label: string;
  color: string;
  dimColor: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export function SportScreen({ sport, label, color, dimColor, icon }: SportScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { members, addMemberToSport, removeMember, getStats } = useGym();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const navigateToFiltered = useCallback(
    (filter: 'all' | 'expiring' | 'expired') => {
      router.push({ pathname: '/filtered-members', params: { sport, filter } });
    },
    [router, sport]
  );

  const sportMembers = members[sport];
  const stats = getStats(sport);

  const filtered = useMemo(() => {
    if (!search.trim()) return sportMembers;
    return sportMembers.filter((m) => m.name.includes(search.trim()));
  }, [sportMembers, search]);

  const handleDelete = useCallback(
    (id: string) => {
      const member = sportMembers.find((m) => m.id === id);
      showAlert('حذف المشترك', `هل تريد حذف "${member?.name}"؟`, [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => removeMember(sport, id),
        },
      ]);
    },
    [sport, sportMembers, removeMember, showAlert]
  );

  const handleAdd = useCallback(
    async (data: { name: string; fee: number; phone?: string; photo?: string; startDate: string; endDate: string }) => {
      await addMemberToSport(sport, data);
      setModalVisible(false);
    },
    [sport, addMemberToSport]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: color + '30' }]}>
        <View style={[styles.headerIcon, { backgroundColor: dimColor }]}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.headerTitle}>{label}</Text>
        <Text style={styles.headerSub}>إدارة المشتركين</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatsCard
          label="إجمالي المشتركين"
          value={stats.total}
          color={Colors.statBlue}
          dimColor={Colors.statBlueDim}
          iconName="people"
          onPress={() => navigateToFiltered('all')}
        />
        <StatsCard
          label="ينتهي قريباً"
          value={stats.expiringSoon}
          color={Colors.statYellow}
          dimColor={Colors.statYellowDim}
          iconName="schedule"
          onPress={() => navigateToFiltered('expiring')}
        />
        <StatsCard
          label="منتهي الاشتراك"
          value={stats.expired}
          color={Colors.statRed}
          dimColor={Colors.statRedDim}
          iconName="event-busy"
          onPress={() => navigateToFiltered('expired')}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="بحث باسم المشترك..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MemberCard member={item} sportColor={color} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: dimColor }]}>
              <MaterialIcons name={icon} size={40} color={color + '80'} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'لا نتائج مطابقة' : 'لا يوجد مشتركون بعد'}
            </Text>
            <Text style={styles.emptyDesc}>
              {search ? 'جرب اسماً مختلفاً' : 'اضغط + لإضافة مشترك جديد'}
            </Text>
          </View>
        }
      />

      {/* Developer Footer */}
      <View style={styles.devFooter}>
        <Text style={styles.devFooterText}>تطوير المبرمج: أحمد شرف</Text>
      </View>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: color, bottom: insets.bottom + 80 },
          pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={28} color={Colors.white} />
      </Pressable>

      <AddMemberModal
        visible={modalVisible}
        sportLabel={label}
        sportColor={color}
        onClose={() => setModalVisible(false)}
        onAdd={handleAdd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: 6,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  devFooter: {
    paddingVertical: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  devFooterText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
