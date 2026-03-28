import React, { useState, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import Svg, { Rect, Line, Polyline, G, Text as SvgText, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { computeStatistics, computeRegression } from '@/utils/mathEngine';
import type { StatResult, RegressionResult } from '@/types';

type StatTab = 'Input' | 'Descriptive' | 'Charts' | 'Regression' | 'Probability';

// ──────────────────────────────────────────────────────────────
//  Normal distribution PDF/CDF (approximation)
// ──────────────────────────────────────────────────────────────
function normalPDF(x: number, mean: number, sd: number): number {
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
}
function normalCDF(x: number, mean: number, sd: number): number {
  const z = (x - mean) / (sd * Math.SQRT2);
  return 0.5 * (1 + erf(z));
}
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

export function StatisticsCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<StatTab>('Input');
  const [rawInput, setRawInput] = useState('');
  const [data, setData] = useState<number[]>([]);
  const [parseError, setParseError] = useState('');
  const [stats, setStats] = useState<StatResult | null>(null);
  const [regression, setRegression] = useState<RegressionResult | null>(null);
  const [regDegree, setRegDegree] = useState('1');
  const [probX, setProbX] = useState('');

  const parseData = () => {
    const parts = rawInput
      .split(/[\s,;\n]+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n));
    if (parts.length < 2) {
      setParseError('Enter at least 2 numbers separated by commas or spaces.');
      return;
    }
    setParseError('');
    setData(parts);
    const result = computeStatistics(parts);
    setStats(result);
    setActiveTab('Descriptive');
  };

  const computeReg = () => {
    if (data.length < 2) return;
    const d = parseInt(regDegree) || 1;
    const points: [number, number][] = data.map((y, i) => [i + 1, y]);
    const result = computeRegression(points, d);
    setRegression(result);
  };

  const TABS: StatTab[] = ['Input', 'Descriptive', 'Charts', 'Regression', 'Probability'];

  const W = 300;
  const H = 120;

  // Build histogram
  const buildHistogram = () => {
    if (!stats || data.length < 2) return [];
    const bins = Math.ceil(Math.sqrt(data.length));
    const rangeStep = (stats.max - stats.min) / bins;
    const counts = Array(bins).fill(0);
    data.forEach((v) => {
      const idx = Math.min(Math.floor((v - stats.min) / rangeStep), bins - 1);
      counts[idx]++;
    });
    return counts;
  };
  const histCounts = buildHistogram();
  const maxCount = Math.max(...histCounts, 1);

  // Build box-whisker path points in SVG coords
  const bwData = stats
    ? {
        q1x: ((stats.q1 - stats.min) / (stats.max - stats.min)) * W,
        q3x: ((stats.q3 - stats.min) / (stats.max - stats.min)) * W,
        medx: ((stats.median - stats.min) / (stats.max - stats.min)) * W,
        minx: 0,
        maxx: W,
      }
    : null;

  // Probability distribution curve
  const normalCurvePoints = (() => {
    if (!stats || stats.stdDev === 0) return '';
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const x = stats.mean - 4 * stats.stdDev + (i / 100) * 8 * stats.stdDev;
      const y = normalPDF(x, stats.mean, stats.stdDev);
      const sx = (i / 100) * W;
      const sy = H - (y / normalPDF(stats.mean, stats.mean, stats.stdDev)) * (H - 10);
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  const probResult = stats && probX
    ? `P(X ≤ ${probX}) = ${(normalCDF(parseFloat(probX), stats.mean, stats.stdDev) * 100).toFixed(2)}%`
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Statistics</Text>
      </View>

      {/* Sub tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, { backgroundColor: activeTab === tab ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="tab" accessibilityLabel={tab} accessibilityState={{ selected: activeTab === tab }}>
            <Text style={[styles.tabLabel, { color: activeTab === tab ? '#FFF' : colors.textSecondary }]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'Input' && (
          <View style={styles.section}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Enter data values separated by commas, spaces, or newlines</Text>
            <TextInput
              value={rawInput}
              onChangeText={setRawInput}
              multiline
              numberOfLines={6}
              placeholder="e.g. 1, 2, 3, 4, 5"
              placeholderTextColor={colors.textDisabled}
              style={[styles.bigInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgSurface }]}
              accessibilityLabel="Data input"
            />
            {!!parseError && <Text style={styles.error}>{parseError}</Text>}
            <Pressable onPress={parseData} style={[styles.calcBtn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Analyze data">
              <Text style={styles.calcBtnLabel}>Analyze Data ({data.length > 0 ? `n=${data.length}` : 'n=0'})</Text>
            </Pressable>
          </View>
        )}

        {activeTab === 'Descriptive' && stats && (
          <View style={styles.section}>
            {[
              ['Count (n)', stats.count],
              ['Sum', stats.sum.toFixed(4)],
              ['Mean', stats.mean.toFixed(6)],
              ['Median', stats.median.toFixed(6)],
              ['Mode', stats.mode?.join(', ') ?? '—'],
              ['Std Dev (σ)', stats.stdDev.toFixed(6)],
              ['Variance (σ²)', stats.variance.toFixed(6)],
              ['Std Error', (stats.stdDev / Math.sqrt(stats.count)).toFixed(6)],
              ['Skewness', stats.skewness?.toFixed(4) ?? '—'],
              ['Kurtosis', stats.kurtosis?.toFixed(4) ?? '—'],
              ['Min', stats.min],
              ['Q1', stats.q1.toFixed(4)],
              ['Q3', stats.q3.toFixed(4)],
              ['Max', stats.max],
              ['IQR', stats.iqr?.toFixed(4) ?? '—'],
              ['Range', (stats.max - stats.min).toFixed(4)],
            ].map(([label, val]) => (
              <View key={String(label)} style={[styles.statRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{val}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Charts' && stats && (
          <View style={styles.section}>
            {/* Histogram */}
            <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>Histogram</Text>
            <Svg width={W} height={H + 20}>
              {histCounts.map((count, i) => {
                const bw = W / histCounts.length;
                const bh = (count / maxCount) * H;
                return (
                  <Rect key={i} x={i * bw + 1} y={H - bh} width={bw - 2} height={bh} fill={colors.accentPrimary} opacity={0.8} />
                );
              })}
              <Line x1={0} y1={H} x2={W} y2={H} stroke={colors.border} strokeWidth={1} />
            </Svg>

            {/* Box-Whisker */}
            {bwData && (
              <>
                <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>Box-Whisker Plot</Text>
                <Svg width={W} height={60}>
                  {/* Whiskers */}
                  <Line x1={bwData.minx} y1={30} x2={bwData.q1x} y2={30} stroke={colors.textSecondary} strokeWidth={2} />
                  <Line x1={bwData.q3x} y1={30} x2={bwData.maxx} y2={30} stroke={colors.textSecondary} strokeWidth={2} />
                  {/* Box */}
                  <Rect x={bwData.q1x} y={15} width={bwData.q3x - bwData.q1x} height={30} fill={colors.accentPrimary} opacity={0.3} stroke={colors.accentPrimary} strokeWidth={2} />
                  {/* Median */}
                  <Line x1={bwData.medx} y1={15} x2={bwData.medx} y2={45} stroke={colors.accentPrimary} strokeWidth={3} />
                  {/* Whisker caps */}
                  <Line x1={0} y1={20} x2={0} y2={40} stroke={colors.textSecondary} strokeWidth={2} />
                  <Line x1={W} y1={20} x2={W} y2={40} stroke={colors.textSecondary} strokeWidth={2} />
                </Svg>
              </>
            )}
          </View>
        )}

        {activeTab === 'Regression' && (
          <View style={styles.section}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Fit a polynomial to your data (y values at x=1,2,3,...)</Text>
            <View style={styles.paramRow}>
              <Text style={[styles.paramLabel, { color: colors.textSecondary }]}>Polynomial Degree</Text>
              <TextInput value={regDegree} onChangeText={setRegDegree} keyboardType="number-pad" style={[styles.paramInput, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Polynomial degree" />
            </View>
            <Pressable onPress={computeReg} style={[styles.calcBtn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Fit regression">
              <Text style={styles.calcBtnLabel}>Fit Regression</Text>
            </Pressable>
            {regression && (
              <View>
                <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>R²</Text>
                  <Text style={[styles.statValue, { color: colors.accentPrimary }]}>{regression.rSquared.toFixed(6)}</Text>
                </View>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>Coefficients (a₀ + a₁x + a₂x² ...)</Text>
                {regression.coefficients.map((c, i) => (
                  <View key={i} style={[styles.statRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>a{i}</Text>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>{c.toFixed(6)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'Probability' && (
          <View style={styles.section}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Normal distribution using your dataset mean and standard deviation</Text>
            {stats && (
              <Text style={[styles.hint, { color: colors.textSecondary }]}>μ = {stats.mean.toFixed(4)}  σ = {stats.stdDev.toFixed(4)}</Text>
            )}
            <Svg width={W} height={H}>
              {normalCurvePoints ? (
                <>
                  <Polyline points={normalCurvePoints} fill="none" stroke={colors.accentPrimary} strokeWidth={2} />
                  <Line x1={0} y1={H} x2={W} y2={H} stroke={colors.border} strokeWidth={1} />
                </>
              ) : (
                <SvgText x={W / 2} y={H / 2} textAnchor="middle" fill={colors.textDisabled} fontSize={13}>Enter data to see distribution</SvgText>
              )}
            </Svg>
            <View style={styles.paramRow}>
              <Text style={[styles.paramLabel, { color: colors.textSecondary }]}>P(X ≤ x), x =</Text>
              <TextInput value={probX} onChangeText={setProbX} keyboardType="decimal-pad" style={[styles.paramInput, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="x value for probability" />
            </View>
            {probResult && (
              <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.accentPrimary }]}>{probResult}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  tabBar: { maxHeight: 52 },
  tabBarContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  tab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  content: { padding: 16, alignItems: 'center' },
  section: { width: '100%', gap: 8 },
  hint: { fontSize: 13, lineHeight: 18 },
  error: { color: '#FF5A5A', fontSize: 13 },
  bigInput: { borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 16, minHeight: 120, textAlignVertical: 'top' },
  calcBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  calcBtnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 10 },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 14, fontWeight: '600' },
  chartTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 6 },
  paramRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paramLabel: { fontSize: 14 },
  paramInput: { borderWidth: 1, borderRadius: 10, padding: 8, fontSize: 16, width: 80, textAlign: 'center' },
});
