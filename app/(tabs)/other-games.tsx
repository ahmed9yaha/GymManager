// Powered by OnSpace.AI
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { useTableGames } from '@/hooks/useTableGames';
import { TableCard } from '@/components/feature/TableCard';
import { TableSessionModal } from '@/components/feature/TableSessionModal';
import { TableSettingsModal } from '@/components/feature/TableSettingsModal';
import { SessionMode, GameType, GameSettings } from '@/services/tableGames';

const BILLIARDS_COLOR = '#F97316';
const BILLIARDS_DIM = '#2D1500';
const TT_COLOR = '#06B6D4';
const TT_DIM = '#001E24';

// ── Date helpers ────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseDateISO(s: string): Date | null {
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
}

// ── Stop Confirmation Modal ──────────────────────────────────────────────────

interface StopModalProps {
  visible: boolean;
  tableNumber: number;
  gameType: GameType;
  color: string;
  finalCost: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function StopConfirmModal({
  visible,
  tableNumber,
  gameType,
  color,
  finalCost,
  onCancel,
  onConfirm,
}: StopModalProps) {
  const gameLabel = gameType === 'billiards' ? 'بلياردو' : 'تنس الطاولة';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={stopStyles.overlay}>
        <View style={stopStyles.card}>
          <View style={[stopStyles.strip, { backgroundColor: Colors.danger }]} />
          <View style={stopStyles.body}>
            <View style={[stopStyles.iconWrap, { backgroundColor: Colors.danger + '20' }]}>
              <MaterialIcons name="stop-circle" size={40} color={Colors.danger} />
            </View>
            <Text style={stopStyles.title}>إيقاف الجلسة</Text>
            <Text style={stopStyles.subtitle}>
              {gameLabel} — طاولة {tableNumber}
            </Text>

            {/* Final cost highlight */}
            <View style={[stopStyles.costBox, { backgroundColor: color + '15', borderColor: color + '40' }]}>
              <MaterialIcons name="payments" size={20} color={color} />
              <View style={stopStyles.costTextWrap}>
                <Text style={[stopStyles.costLabel, { color: Colors.textSecondary }]}>
                  المبلغ المستحق
                </Text>
                <Text style={[stopStyles.costValue, { color }]}>
                  {finalCost.toLocaleString('ar-SA')} ريال يمني
                </Text>
              </View>
            </View>

            <Text style={stopStyles.note}>
              سيُضاف هذا المبلغ إلى تقارير اليوم تلقائياً
            </Text>

            <View style={stopStyles.actions}>
              <Pressable
                style={({ pressed }) => [stopStyles.cancelBtn, pressed && { opacity: 0.75 }]}
                onPress={onCancel}
              >
                <Text style={stopStyles.cancelText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [stopStyles.confirmBtn, pressed && { opacity: 0.85 }]}
                onPress={onConfirm}
              >
                <MaterialIcons name="check" size={18} color={Colors.white} />
                <Text style={stopStyles.confirmText}>تأكيد الإيقاف</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const stopStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    width: '100%',
    overflow: 'hidden',
  },
  strip: {
    height: 4,
  },
  body: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  costBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.sm,
    width: '100%',
  },
  costTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  costLabel: {
    fontSize: FontSize.xs,
    marginBottom: 3,
  },
  costValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  note: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  cancelText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  confirmText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});

// ── Custom Report Date Picker Modal ──────────────────────────────────────────

interface CustomReportModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (from: Date, to: Date) => void;
}

function CustomReportModal({ visible, onClose, onApply }: CustomReportModalProps) {
  const today = new Date();
  const [fromStr, setFromStr] = useState(formatDateISO(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [toStr, setToStr] = useState(formatDateISO(today));
  const [error, setError] = useState('');

  const handleApply = () => {
    const from = parseDateISO(fromStr);
    const to = parseDateISO(toStr);
    if (!from || !to) {
      setError('صيغة التاريخ غير صحيحة (YYYY-MM-DD)');
      return;
    }
    if (from > to) {
      setError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }
    setError('');
    onApply(startOfDay(from), endOfDay(to));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={crStyles.overlay} onPress={onClose}>
        <Pressable style={crStyles.sheet} onPress={() => {}}>
          <View style={[crStyles.strip, { backgroundColor: Colors.reports }]} />
          <View style={crStyles.header}>
            <Text style={crStyles.title}>تقرير مخصص</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={crStyles.body}>
            <View style={crStyles.row}>
              <View style={crStyles.fieldWrap}>
                <Text style={crStyles.fieldLabel}>من تاريخ</Text>
                <TextInput
                  style={crStyles.input}
                  value={fromStr}
                  onChangeText={setFromStr}
                  placeholder="2025-01-01"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                  textAlign="center"
                />
              </View>
              <MaterialIcons name="arrow-back" size={20} color={Colors.textMuted} style={{ marginTop: 28 }} />
              <View style={crStyles.fieldWrap}>
                <Text style={crStyles.fieldLabel}>إلى تاريخ</Text>
                <TextInput
                  style={crStyles.input}
                  value={toStr}
                  onChangeText={setToStr}
                  placeholder="2025-12-31"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                  textAlign="center"
                />
              </View>
            </View>

            {error ? <Text style={crStyles.error}>{error}</Text> : null}

            <Text style={crStyles.hint}>أدخل التواريخ بصيغة: YYYY-MM-DD</Text>

            <Pressable
              style={({ pressed }) => [crStyles.applyBtn, pressed && { opacity: 0.85 }]}
              onPress={handleApply}
            >
              <MaterialIcons name="search" size={20} color={Colors.white} />
              <Text style={crStyles.applyText}>عرض التقرير</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const crStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  strip: {
    height: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 36,
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  fieldWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    textAlign: 'center',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.reports,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  applyText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});

// ── Report Panel ─────────────────────────────────────────────────────────────

interface ReportPanelProps {
  label: string;
  from: Date;
  to: Date;
  getReport: (from: Date, to: Date) => ReturnType<ReturnType<typeof useTableGames>['getReport']>;
}

function ReportPanel({ label, from, to, getReport }: ReportPanelProps) {
  const data = useMemo(() => getReport(from, to), [getReport, from, to]);

  const totalHours = data.totalMinutes >= 60
    ? `${Math.floor(data.totalMinutes / 60)}س ${data.totalMinutes % 60}د`
    : `${data.totalMinutes}د`;

  return (
    <View style={rpStyles.container}>
      <View style={rpStyles.labelRow}>
        <MaterialIcons name="bar-chart" size={16} color={Colors.reports} />
        <Text style={rpStyles.label}>{label}</Text>
      </View>

      {data.totalSessions === 0 ? (
        <View style={rpStyles.emptyWrap}>
          <MaterialIcons name="inbox" size={32} color={Colors.textMuted} />
          <Text style={rpStyles.empty}>لا توجد جلسات مسجلة في هذه الفترة</Text>
        </View>
      ) : (
        <>
          {/* Total Revenue */}
          <View style={[rpStyles.totalCard, { borderColor: Colors.reports + '40' }]}>
            <View style={rpStyles.totalLeft}>
              <Text style={rpStyles.totalLabel}>إجمالي الأرباح</Text>
              <Text style={[rpStyles.totalValue, { color: Colors.reports }]}>
                {data.totalCost.toLocaleString('ar-SA')} ر.ي
              </Text>
            </View>
            <View style={[rpStyles.totalIcon, { backgroundColor: Colors.reportsDim }]}>
              <MaterialIcons name="account-balance-wallet" size={26} color={Colors.reports} />
            </View>
          </View>

          {/* Meta row */}
          <View style={rpStyles.metaRow}>
            <View style={[rpStyles.metaChip, { backgroundColor: Colors.statBlueDim, borderColor: Colors.statBlue + '30' }]}>
              <MaterialIcons name="table-restaurant" size={14} color={Colors.statBlue} />
              <Text style={[rpStyles.metaChipText, { color: Colors.statBlue }]}>
                {data.totalSessions} جلسة
              </Text>
            </View>
            <View style={[rpStyles.metaChip, { backgroundColor: Colors.statYellowDim, borderColor: Colors.statYellow + '30' }]}>
              <MaterialIcons name="schedule" size={14} color={Colors.statYellow} />
              <Text style={[rpStyles.metaChipText, { color: Colors.statYellow }]}>
                {totalHours}
              </Text>
            </View>
          </View>

          {/* Game breakdown */}
          <View style={rpStyles.breakdown}>
            {/* Billiards */}
            <View style={[rpStyles.breakCard, { backgroundColor: BILLIARDS_DIM, borderColor: BILLIARDS_COLOR + '30' }]}>
              <MaterialIcons name="sports-esports" size={20} color={BILLIARDS_COLOR} />
              <Text style={[rpStyles.breakName, { color: BILLIARDS_COLOR }]}>بلياردو</Text>
              <Text style={[rpStyles.breakCount, { color: Colors.textSecondary }]}>
                {data.billiardsCount} جلسة
              </Text>
              <Text style={[rpStyles.breakCost, { color: BILLIARDS_COLOR }]}>
                {data.billiardsCost.toLocaleString('ar-SA')} ر.ي
              </Text>
            </View>
            {/* Table Tennis */}
            <View style={[rpStyles.breakCard, { backgroundColor: TT_DIM, borderColor: TT_COLOR + '30' }]}>
              <MaterialIcons name="sports-tennis" size={20} color={TT_COLOR} />
              <Text style={[rpStyles.breakName, { color: TT_COLOR }]}>تنس الطاولة</Text>
              <Text style={[rpStyles.breakCount, { color: Colors.textSecondary }]}>
                {data.ttCount} جلسة
              </Text>
              <Text style={[rpStyles.breakCost, { color: TT_COLOR }]}>
                {data.ttCost.toLocaleString('ar-SA')} ر.ي
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const rpStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  empty: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  totalCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.reportsDim,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  totalLeft: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  totalIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
  },
  metaChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  breakdown: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  breakCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'flex-end',
    gap: 3,
    borderWidth: 1,
  },
  breakName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  breakCount: {
    fontSize: FontSize.xs,
    textAlign: 'right',
  },
  breakCost: {
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 2,
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

type ReportTab = 'today' | 'custom';

interface StopTarget {
  tableId: string;
  tableNumber: number;
  gameType: GameType;
  finalCost: number;
}

export default function OtherGamesScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, settings, tick, startSession, stopSession, getActiveSession, calcFinalCost, getReport } = useTableGames();

  const [sessionModal, setSessionModal] = useState<{
    visible: boolean;
    tableId: string;
    tableNumber: number;
    gameType: GameType;
  } | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [stopTarget, setStopTarget] = useState<StopTarget | null>(null);
  const [reportTab, setReportTab] = useState<ReportTab>('today');
  const [customReportVisible, setCustomReportVisible] = useState(false);
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null);

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
        mode,
        customRate
      );
      setSessionModal(null);
    },
    [sessionModal, startSession]
  );

  const handleStopPress = useCallback(
    (tableId: string, tableNumber: number, gameType: GameType) => {
      const cost = calcFinalCost(tableId);
      setStopTarget({ tableId, tableNumber, gameType, finalCost: cost });
    },
    [calcFinalCost]
  );

  const handleConfirmStop = useCallback(async () => {
    if (!stopTarget) return;
    await stopSession(stopTarget.tableId, stopTarget.finalCost);
    setStopTarget(null);
  }, [stopTarget, stopSession]);

  const { updateSettings } = useTableGames();

  // Today's range
  const todayFrom = useMemo(() => startOfDay(new Date()), [tick]);
  const todayTo = useMemo(() => endOfDay(new Date()), [tick]);

  // Summary stats
  const activeBilliards = useMemo(() =>
    Array.from({ length: billiardsCount }, (_, i) =>
      getActiveSession(`billiards_${i + 1}`)
    ).filter(Boolean).length,
    [billiardsCount, sessions, tick]
  );
  const activeTT = useMemo(() =>
    Array.from({ length: ttCount }, (_, i) =>
      getActiveSession(`tabletennis_${i + 1}`)
    ).filter(Boolean).length,
    [ttCount, sessions, tick]
  );

  const handleCustomRangeApply = useCallback((from: Date, to: Date) => {
    setCustomRange({ from, to });
    setReportTab('custom');
  }, []);

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
            {activeBilliards}/{billiardsCount} بلياردو
          </Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: TT_DIM, borderColor: TT_COLOR + '40' }]}>
          <MaterialIcons name="sports-tennis" size={14} color={TT_COLOR} />
          <Text style={[styles.statChipText, { color: TT_COLOR }]}>
            {activeTT}/{ttCount} تنس
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
                onStop={() => handleStopPress(tableId, i + 1, 'billiards')}
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
                onStop={() => handleStopPress(tableId, i + 1, 'tabletennis')}
              />
            );
          })}
        </View>

        {/* ── Reports Section ─────────────────────────────────────────────── */}
        <View style={styles.reportsSection}>
          <View style={styles.reportsSectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.reportsDim }]}>
              <MaterialIcons name="bar-chart" size={18} color={Colors.reports} />
            </View>
            <Text style={[styles.sectionTitle, { color: Colors.reports }]}>التقارير</Text>
          </View>

          {/* Tab toggle */}
          <View style={styles.tabRow}>
            <Pressable
              style={({ pressed }) => [
                styles.tabBtn,
                reportTab === 'today'
                  ? { backgroundColor: Colors.reports, borderColor: Colors.reports }
                  : { backgroundColor: Colors.card, borderColor: Colors.border },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setReportTab('today')}
            >
              <MaterialIcons
                name="today"
                size={15}
                color={reportTab === 'today' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[
                styles.tabBtnText,
                { color: reportTab === 'today' ? Colors.white : Colors.textSecondary },
              ]}>
                تقرير اليوم
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.tabBtn,
                reportTab === 'custom'
                  ? { backgroundColor: Colors.reports, borderColor: Colors.reports }
                  : { backgroundColor: Colors.card, borderColor: Colors.border },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setCustomReportVisible(true)}
            >
              <MaterialIcons
                name="date-range"
                size={15}
                color={reportTab === 'custom' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[
                styles.tabBtnText,
                { color: reportTab === 'custom' ? Colors.white : Colors.textSecondary },
              ]}>
                تقرير مخصص
              </Text>
            </Pressable>
          </View>

          {/* Custom range indicator */}
          {reportTab === 'custom' && customRange ? (
            <View style={styles.rangeChip}>
              <MaterialIcons name="date-range" size={13} color={Colors.reports} />
              <Text style={styles.rangeChipText}>
                {formatDateISO(customRange.from)} ← {formatDateISO(customRange.to)}
              </Text>
              <Pressable onPress={() => setCustomReportVisible(true)}>
                <MaterialIcons name="edit" size={14} color={Colors.textMuted} />
              </Pressable>
            </View>
          ) : null}

          {/* Report panel */}
          {reportTab === 'today' ? (
            <ReportPanel
              label="أرباح اليوم"
              from={todayFrom}
              to={todayTo}
              getReport={getReport}
            />
          ) : customRange ? (
            <ReportPanel
              label={`${formatDateISO(customRange.from)} → ${formatDateISO(customRange.to)}`}
              from={customRange.from}
              to={customRange.to}
              getReport={getReport}
            />
          ) : (
            <View style={styles.noCustomWrap}>
              <MaterialIcons name="date-range" size={32} color={Colors.textMuted} />
              <Text style={styles.noCustomText}>اضغط "تقرير مخصص" لاختيار الفترة الزمنية</Text>
            </View>
          )}
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
        onSave={updateSettings}
      />

      {/* Stop Confirmation Modal */}
      {stopTarget ? (
        <StopConfirmModal
          visible={true}
          tableNumber={stopTarget.tableNumber}
          gameType={stopTarget.gameType}
          color={stopTarget.gameType === 'billiards' ? BILLIARDS_COLOR : TT_COLOR}
          finalCost={stopTarget.finalCost}
          onCancel={() => setStopTarget(null)}
          onConfirm={handleConfirmStop}
        />
      ) : null}

      {/* Custom Report Modal */}
      <CustomReportModal
        visible={customReportVisible}
        onClose={() => setCustomReportVisible(false)}
        onApply={handleCustomRangeApply}
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
  // Reports
  reportsSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  reportsSectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tabRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  rangeChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.reportsDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.reports + '30',
    alignSelf: 'flex-end',
  },
  rangeChipText: {
    fontSize: FontSize.xs,
    color: Colors.reports,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noCustomWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noCustomText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
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
