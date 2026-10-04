// Powered by OnSpace.AI
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { getMemberStatus } from '@/services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;

const SPORT_LABELS: { [key: string]: string } = {
  boxing: 'ملاكمة',
  kickboxing: 'كيك بوكسينغ',
  karate: 'كاراتيه',
  gymnastics: 'جمباز',
};

const SPORT_COLORS: { [key: string]: string } = {
  boxing: Colors.boxing,
  kickboxing: Colors.kickboxing,
  karate: Colors.karate,
  gymnastics: Colors.gymnastics,
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { members } = useGym();

  const stats = useMemo(() => {
    const sports = ['boxing', 'kickboxing', 'karate', 'gymnastics'];
    let totalRevenue = 0;
    let totalActive = 0;
    let totalExpired = 0;
    let totalExpiring = 0;
    const sportCounts: { [key: string]: number } = {};
    const sportRevenue: { [key: string]: number } = {};

    sports.forEach((sport) => {
      const list = members[sport as keyof typeof members];
      const count = list.length;
      const revenue = list.reduce((sum, m) => sum + m.fee, 0);
      sportCounts[sport] = count;
      sportRevenue[sport] = revenue;
      totalRevenue += revenue;

      list.forEach((m) => {
        const status = getMemberStatus(m.endDate);
        if (status === 'active') totalActive++;
        else if (status === 'expired') totalExpired++;
        else if (status === 'expiring') totalExpiring++;
      });
    });

    const totalMembers = Object.values(sportCounts).reduce((a, b) => a + b, 0);

    return {
      totalRevenue,
      totalMembers,
      totalActive,
      totalExpired,
      totalExpiring,
      sportCounts,
      sportRevenue,
    };
  }, [members]);

  const maxCount = Math.max(...Object.values(stats.sportCounts), 1);
  const maxRevenue = Math.max(...Object.values(stats.sportRevenue), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Colors.reportsDim }]}>
          <MaterialIcons name="bar-chart" size={24} color={Colors.reports} />
        </View>
        <Text style={styles.headerTitle}>التقارير والإحصائيات</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Total Revenue Card */}
        <View style={[styles.revenueCard, { borderColor: Colors.reports + '40' }]}>
          <View style={styles.revenueTop}>
            <View style={[styles.revIcon, { backgroundColor: Colors.reportsDim }]}>
              <MaterialIcons name="account-balance-wallet" size={28} color={Colors.reports} />
            </View>
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueLabel}>إجمالي أرباح النادي</Text>
              <Text style={[styles.revenueValue, { color: Colors.reports }]}>
                {stats.totalRevenue.toLocaleString('ar-SA')} ر.ي
              </Text>
            </View>
          </View>
          <View style={styles.revenueMeta}>
            <View style={styles.revenueMetaItem}>
              <Text style={styles.revenueMetaValue}>{stats.totalMembers}</Text>
              <Text style={styles.revenueMetaLabel}>إجمالي المشتركين</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueMetaItem}>
              <Text style={[styles.revenueMetaValue, { color: Colors.success }]}>{stats.totalActive}</Text>
              <Text style={styles.revenueMetaLabel}>اشتراك نشط</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueMetaItem}>
              <Text style={[styles.revenueMetaValue, { color: Colors.danger }]}>{stats.totalExpired}</Text>
              <Text style={styles.revenueMetaLabel}>اشتراك منتهي</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueMetaItem}>
              <Text style={[styles.revenueMetaValue, { color: Colors.warning }]}>{stats.totalExpiring}</Text>
              <Text style={styles.revenueMetaLabel}>ينتهي قريباً</Text>
            </View>
          </View>
        </View>

        {/* Members by Sport — Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عدد المشتركين لكل رياضة</Text>
          <View style={styles.chartCard}>
            {['boxing', 'kickboxing', 'karate', 'gymnastics'].map((sport) => {
              const count = stats.sportCounts[sport];
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const color = SPORT_COLORS[sport];
              return (
                <View key={sport} style={styles.barRow}>
                  <Text style={styles.barLabel}>{SPORT_LABELS[sport]}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(pct, 2)}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barValue, { color }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Revenue by Sport — Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأرباح لكل رياضة (ر.ي)</Text>
          <View style={styles.chartCard}>
            {['boxing', 'kickboxing', 'karate', 'gymnastics'].map((sport) => {
              const rev = stats.sportRevenue[sport];
              const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
              const color = SPORT_COLORS[sport];
              return (
                <View key={sport} style={styles.barRow}>
                  <Text style={styles.barLabel}>{SPORT_LABELS[sport]}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(pct, 2)}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barValue, { color }]}>
                    {rev >= 1000 ? `${(rev / 1000).toFixed(1)}k` : rev}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pie-style Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توزيع الاشتراكات حسب الرياضة</Text>
          <View style={styles.chartCard}>
            {stats.totalMembers === 0 ? (
              <Text style={styles.noDataText}>لا توجد بيانات بعد</Text>
            ) : (
              <>
                {/* Visual Pie Bar */}
                <View style={styles.pieBar}>
                  {['boxing', 'kickboxing', 'karate', 'gymnastics'].map((sport) => {
                    const count = stats.sportCounts[sport];
                    if (count === 0) return null;
                    const pct = stats.totalMembers > 0 ? (count / stats.totalMembers) * 100 : 0;
                    return (
                      <View
                        key={sport}
                        style={[
                          styles.pieSegment,
                          { flex: count, backgroundColor: SPORT_COLORS[sport] },
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                  {['boxing', 'kickboxing', 'karate', 'gymnastics'].map((sport) => {
                    const count = stats.sportCounts[sport];
                    const pct =
                      stats.totalMembers > 0
                        ? ((count / stats.totalMembers) * 100).toFixed(1)
                        : '0';
                    return (
                      <View key={sport} style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: SPORT_COLORS[sport] },
                          ]}
                        />
                        <Text style={styles.legendLabel}>{SPORT_LABELS[sport]}</Text>
                        <Text style={[styles.legendPct, { color: SPORT_COLORS[sport] }]}>
                          {pct}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Active vs Expired */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الاشتراكات النشطة مقابل المنتهية</Text>
          <View style={styles.chartCard}>
            {stats.totalMembers === 0 ? (
              <Text style={styles.noDataText}>لا توجد بيانات بعد</Text>
            ) : (
              <>
                <View style={styles.statusPieBar}>
                  {stats.totalActive > 0 ? (
                    <View
                      style={[
                        styles.statusSegment,
                        { flex: stats.totalActive, backgroundColor: Colors.success },
                      ]}
                    />
                  ) : null}
                  {stats.totalExpiring > 0 ? (
                    <View
                      style={[
                        styles.statusSegment,
                        { flex: stats.totalExpiring, backgroundColor: Colors.warning },
                      ]}
                    />
                  ) : null}
                  {stats.totalExpired > 0 ? (
                    <View
                      style={[
                        styles.statusSegment,
                        { flex: stats.totalExpired, backgroundColor: Colors.danger },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.statusCards}>
                  <View style={[styles.statusCard, { borderColor: Colors.success + '40' }]}>
                    <Text style={[styles.statusCardValue, { color: Colors.success }]}>
                      {stats.totalActive}
                    </Text>
                    <Text style={styles.statusCardLabel}>نشط</Text>
                    <Text style={[styles.statusCardPct, { color: Colors.success }]}>
                      {stats.totalMembers > 0
                        ? ((stats.totalActive / stats.totalMembers) * 100).toFixed(0)
                        : 0}
                      %
                    </Text>
                  </View>
                  <View style={[styles.statusCard, { borderColor: Colors.warning + '40' }]}>
                    <Text style={[styles.statusCardValue, { color: Colors.warning }]}>
                      {stats.totalExpiring}
                    </Text>
                    <Text style={styles.statusCardLabel}>ينتهي قريباً</Text>
                    <Text style={[styles.statusCardPct, { color: Colors.warning }]}>
                      {stats.totalMembers > 0
                        ? ((stats.totalExpiring / stats.totalMembers) * 100).toFixed(0)
                        : 0}
                      %
                    </Text>
                  </View>
                  <View style={[styles.statusCard, { borderColor: Colors.danger + '40' }]}>
                    <Text style={[styles.statusCardValue, { color: Colors.danger }]}>
                      {stats.totalExpired}
                    </Text>
                    <Text style={styles.statusCardLabel}>منتهي</Text>
                    <Text style={[styles.statusCardPct, { color: Colors.danger }]}>
                      {stats.totalMembers > 0
                        ? ((stats.totalExpired / stats.totalMembers) * 100).toFixed(0)
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
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
    borderBottomColor: Colors.reports + '30',
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
  content: {
    padding: Spacing.xl,
  },
  revenueCard: {
    backgroundColor: Colors.reportsDim,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  revenueTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  revIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  revenueLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  revenueMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  revenueMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  revenueMetaValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  revenueMetaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  revenueDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  barLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 72,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    width: 36,
    textAlign: 'left',
  },
  noDataText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  pieBar: {
    flexDirection: 'row-reverse',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  pieSegment: {
    height: '100%',
  },
  legend: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  legendPct: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  statusPieBar: {
    flexDirection: 'row-reverse',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  statusSegment: {
    height: '100%',
  },
  statusCards: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  statusCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusCardValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  statusCardLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginVertical: 2,
    textAlign: 'center',
  },
  statusCardPct: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
