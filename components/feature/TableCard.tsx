// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TableSession,
  calcRemainingSeconds,
  calcElapsedSeconds,
  calcCost,
  formatDuration,
  modeLabel,
} from '@/services/tableGames';
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme';

interface TableCardProps {
  tableId: string;
  tableNumber: number;
  gameType: 'billiards' | 'tabletennis';
  color: string;
  dimColor: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  activeSession?: TableSession;
  tick: number;
  onPress: () => void;
  onStop: () => void;
}

export const TableCard = memo(
  ({
    tableId,
    tableNumber,
    gameType,
    color,
    dimColor,
    icon,
    activeSession,
    tick,
    onPress,
    onStop,
  }: TableCardProps) => {
    const now = Date.now();
    const isActive = !!activeSession;

    let timerDisplay = '--:--';
    let costDisplay = '0 ر.ي';
    let isExpired = false;

    if (isActive && activeSession) {
      const cost = calcCost(activeSession, now);
      costDisplay = `${cost.toLocaleString('ar-SA')} ر.ي`;

      if (activeSession.mode === 'open') {
        const elapsed = calcElapsedSeconds(activeSession, now);
        timerDisplay = formatDuration(elapsed);
      } else {
        const remaining = calcRemainingSeconds(activeSession, now);
        timerDisplay = formatDuration(remaining);
        isExpired = remaining === 0;
      }
    }

    const borderColor = isExpired
      ? Colors.danger + '80'
      : isActive
      ? color + '60'
      : Colors.border;

    const bgColor = isExpired
      ? Colors.statRedDim
      : isActive
      ? dimColor
      : Colors.card;

    return (
      <View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
        {/* Status strip */}
        <View
          style={[
            styles.strip,
            {
              backgroundColor: isExpired
                ? Colors.danger
                : isActive
                ? color
                : Colors.border,
            },
          ]}
        />

        <View style={styles.body}>
          {/* Table header */}
          <View style={styles.topRow}>
            <View style={[styles.iconWrap, { backgroundColor: color + '25' }]}>
              <MaterialIcons name={icon} size={22} color={color} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.tableName}>طاولة {tableNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isExpired
                      ? Colors.statRedDim
                      : isActive
                      ? color + '20'
                      : Colors.surface,
                    borderColor: isExpired
                      ? Colors.danger + '50'
                      : isActive
                      ? color + '40'
                      : Colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isExpired
                        ? Colors.danger
                        : isActive
                        ? color
                        : Colors.textMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      color: isExpired
                        ? Colors.danger
                        : isActive
                        ? color
                        : Colors.textMuted,
                    },
                  ]}
                >
                  {isExpired
                    ? 'انتهى الوقت!'
                    : isActive
                    ? activeSession!.mode === 'open'
                      ? 'وقت مفتوح'
                      : modeLabel(activeSession!.mode)
                    : 'متاحة'}
                </Text>
              </View>
            </View>
          </View>

          {/* Timer display */}
          {isActive ? (
            <View style={styles.timerBlock}>
              <Text style={[styles.timerLabel, { color: Colors.textMuted }]}>
                {activeSession!.mode === 'open' ? 'الوقت المستهلك' : 'الوقت المتبقي'}
              </Text>
              <Text
                style={[
                  styles.timer,
                  {
                    color: isExpired
                      ? Colors.danger
                      : activeSession!.mode === 'open'
                      ? color
                      : Colors.textPrimary,
                  },
                ]}
              >
                {timerDisplay}
              </Text>
              <View style={styles.costRow}>
                <MaterialIcons name="payments" size={14} color={Colors.reports} />
                <Text style={[styles.costText, { color: Colors.reports }]}>
                  {costDisplay}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.availableText}>اضغط لبدء جلسة جديدة</Text>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.startBtn,
                isActive
                  ? { backgroundColor: Colors.statBlueDim, borderColor: Colors.statBlue + '40', flex: 0.48 }
                  : { backgroundColor: color, borderColor: color, flex: 1 },
                pressed && { opacity: 0.8 },
              ]}
              onPress={onPress}
            >
              <MaterialIcons
                name={isActive ? 'edit' : 'play-arrow'}
                size={16}
                color={isActive ? Colors.statBlue : Colors.white}
              />
              <Text
                style={[
                  styles.btnText,
                  { color: isActive ? Colors.statBlue : Colors.white },
                ]}
              >
                {isActive ? 'تعديل' : 'بدء الجلسة'}
              </Text>
            </Pressable>

            {isActive ? (
              <Pressable
                style={({ pressed }) => [
                  styles.stopBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onStop}
              >
                <MaterialIcons name="stop" size={16} color={Colors.white} />
                <Text style={styles.stopBtnText}>إيقاف</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  strip: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  tableName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  timerBlock: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  timerLabel: {
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  timer: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  costText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  availableText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 5,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  stopBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.danger,
    gap: 5,
  },
  stopBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
});
