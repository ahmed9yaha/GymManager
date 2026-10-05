// Powered by OnSpace.AI
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { useTableGames } from '@/hooks/useTableGames';
import { TableCard } from '@/components/feature/TableCard';
import { TableSessionModal } from '@/components/feature/TableSessionModal';
import { TableSettingsModal } from '@/components/feature/TableSettingsModal';
import { SessionMode, GameType, GameSettings } from '@/services/tableGames';
import { useAlert } from '@/template';

const BILLIARDS_COLOR = '#F97316';
const BILLIARDS_DIM = '#2A1500';
const TT_COLOR = '#06B6D4';
const TT_DIM = '#001A20';

export default function OtherGamesScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, settings, tick, startSession, stopSession, getActiveSession, updateSettings } = useTableGames();
  const { showAlert } = useAlert();

  const [sessionModal, setSessionModal] = useState<{
    visible: boolean;
    tableId: string;
    tableNumber: number;
    gameType: GameType;
  } | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const billiardsCount = settings.billiards.tableCount;
  const ttCount = settings.tabletennis.tableCount;

  const openSessionModal = useCallback(
    (tableId: string, tableNumber: number, gameType: GameType) => {
      setSessionModal({ visible: true, tableId, tableNumber, gameType });
    },
    []
  );

  const handleStartSession = useCallback(
    async (mode: SessionMode, customRate?: number) => {
      if (!sessionModal) return;
      await startSession(
        sessionModal.tableId,
        sessionModal.tableNumber,
        sessionModal.gameType,
        mode
      );
      setSessionModal(null);
    },
    [sessionModal, startSession]
  );

  const handleStop = useCallback(
    (tableId: string, tableNumber: number) => {
      showAlert(
        'إيقاف الجلسة',
        `هل تريد إنهاء جلسة الطاولة ${tableNumber}؟`,
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'إيقاف', style: 'destructive', onPress: () => stopSession(tableId) },
        ]
      );
    },
    [showAlert, stopSession]
  );

  const handleSaveSettings = useCallback(
    async (newSettings: GameSettings) => {
      await updateSettings(newSettings);
    },
    [updateSettings]
  );

  // Summary stats
  const activeBilliards = Array.from({ length: billiardsCount }, (_, i) =>
    getActiveSession(`billiards_${i + 1}`)
  ).filter(Boolean).length;
  const activeTT = Array.from({ length: ttCount }, (_, i) =>
    getActiveSession(`tabletennis_${i + 1}`)
  ).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}
          onPress={() => setSettingsVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="settings" size={22} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>الألعاب الأخرى</Text>
          <Text style={styles.headerSub}>إدارة الطاولات والجلسات</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: BILLIARDS_DIM }]}>
          <MaterialIcons name="sports-esports" size={24} color={BILLIARDS_COLOR} />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsStrip}>
        <View style={[styles.statChip, { backgroundColor: BILLIARDS_DIM, borderColor: BILLIARDS_COLOR + '40' }]}>
          <MaterialIcons name="sports-esports" size={14} color={BILLIARDS_COLOR} />
          <Text style={[styles.statChipText, { color: BILLIARDS_COLOR }]}>
            {activeBilliards}/{billiardsCount} شغّالة
          </Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: TT_DIM, borderColor: TT_COLOR + '40' }]}>
          <MaterialIcons name="sports-tennis" size={14} color={TT_COLOR} />
          <Text style={[styles.statChipText, { color: TT_COLOR }]}>
            {activeTT}/{ttCount} شغّالة
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Billiards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: BILLIARDS_DIM }]}>
              <MaterialIcons name="sports-esports" size={18} color={BILLIARDS_COLOR} />
            </View>
            <Text style={[styles.sectionTitle, { color: BILLIARDS_COLOR }]}>البلياردو</Text>
            <View style={[styles.rateTag, { backgroundColor: BILLIARDS_DIM, borderColor: BILLIARDS_COLOR + '30' }]}>
              <MaterialIcons name="payments" size={12} color={BILLIARDS_COLOR} />
              <Text style={[styles.rateTagText, { color: BILLIARDS_COLOR }]}>
                {settings.billiards.hourlyRate.toLocaleString('ar-SA')} ر.ي/س
              </Text>
            </View>
          </View>

          {Array.from({ length: billiardsCount }, (_, i) => {
            const tableId = `billiards_${i + 1}`;
            const active = getActiveSession(tableId);
            return (
              <TableCard
                key={tableId}
                tableId={tableId}
                tableNumber={i + 1}
                gameType="billiards"
                color={BILLIARDS_COLOR}
                dimColor={BILLIARDS_DIM}
                icon="sports-esports"
                activeSession={active}
                tick={tick}
                onPress={() => openSessionModal(tableId, i + 1, 'billiards')}
                onStop={() => handleStop(tableId, i + 1)}
              />
            );
          })}
        </View>

        {/* Table Tennis Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: TT_DIM }]}>
              <MaterialIcons name="sports-tennis" size={18} color={TT_COLOR} />
            </View>
            <Text style={[styles.sectionTitle, { color: TT_COLOR }]}>تنس الطاولة</Text>
            <View style={[styles.rateTag, { backgroundColor: TT_DIM, borderColor: TT_COLOR + '30' }]}>
              <MaterialIcons name="payments" size={12} color={TT_COLOR} />
              <Text style={[styles.rateTagText, { color: TT_COLOR }]}>
                {settings.tabletennis.hourlyRate.toLocaleString('ar-SA')} ر.ي/س
              </Text>
            </View>
          </View>

          {Array.from({ length: ttCount }, (_, i) => {
            const tableId = `tabletennis_${i + 1}`;
            const active = getActiveSession(tableId);
            return (
              <TableCard
                key={tableId}
                tableId={tableId}
                tableNumber={i + 1}
                gameType="tabletennis"
                color={TT_COLOR}
                dimColor={TT_DIM}
                icon="sports-tennis"
                activeSession={active}
                tick={tick}
                onPress={() => openSessionModal(tableId, i + 1, 'tabletennis')}
                onStop={() => handleStop(tableId, i + 1)}
              />
            );
          })}
        </View>

        {/* Developer Footer */}
        <View style={styles.devFooter}>
          <Text style={styles.devFooterText}>تطوير المبرمج: أحمد شرف</Text>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Session Modal */}
      {sessionModal ? (
        <TableSessionModal
          visible={sessionModal.visible}
          tableNumber={sessionModal.tableNumber}
          gameType={sessionModal.gameType}
          color={sessionModal.gameType === 'billiards' ? BILLIARDS_COLOR : TT_COLOR}
          hourlyRate={
            sessionModal.gameType === 'billiards'
              ? settings.billiards.hourlyRate
              : settings.tabletennis.hourlyRate
          }
          onClose={() => setSessionModal(null)}
          onStart={handleStartSession}
        />
      ) : null}

      {/* Settings Modal */}
      <TableSettingsModal
        visible={settingsVisible}
        settings={settings}
        onClose={() => setSettingsVisible(false)}
        onSave={handleSaveSettings}
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BILLIARDS_COLOR + '20',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsStrip: {
    flexDirection: 'row-reverse',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  rateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
  },
  rateTagText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  devFooter: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.md,
  },
  devFooterText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

const BILLIARDS_COLOR = '#F97316';
const BILLIARDS_DIM = '#2A1500';
const TT_COLOR = '#06B6D4';
const TT_DIM = '#001A20';
