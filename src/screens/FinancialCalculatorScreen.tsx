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
import Svg, { Polyline, Line, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useHistoryStore } from '@/store/historyStore';

// ──────────────────────────────────────────────────────────────
//  Sub-tool types
// ──────────────────────────────────────────────────────────────
type FinTab =
  | 'Loan'
  | 'Investment'
  | 'ROI'
  | 'Tax'
  | 'Tip'
  | 'Discount'
  | 'BreakEven';

const TABS: FinTab[] = ['Loan', 'Investment', 'ROI', 'Tax', 'Tip', 'Discount', 'BreakEven'];

// ──────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────
function nf(v: number, digits = 2) {
  return v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}
function buildAmortization(monthly: number, rate: number, balance: number, nper: number) {
  const rows: { period: number; principal: number; interest: number; balance: number }[] = [];
  for (let i = 1; i <= Math.min(nper, 360); i++) {
    const interest = balance * rate;
    const principal = monthly - interest;
    balance -= principal;
    rows.push({ period: i, principal, interest, balance: Math.max(balance, 0) });
  }
  return rows;
}

// ──────────────────────────────────────────────────────────────
//  Loan Tool
// ──────────────────────────────────────────────────────────────
function LoanTool({ colors }: { colors: Record<string, string> }) {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<null | { monthly: number; total: number; interest: number; rows: ReturnType<typeof buildAmortization> }>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (!p || !r || !n) return;
    const monthly = pmt(r, n, p);
    const total = monthly * n;
    const interest = total - p;
    const rows = buildAmortization(monthly, r, p, n);
    setResult({ monthly, total, interest, rows });
  };

  return (
    <ScrollView>
      <Row label="Principal ($)" value={principal} onChange={setPrincipal} colors={colors} />
      <Row label="Annual Rate (%)" value={rate} onChange={setRate} colors={colors} />
      <Row label="Term (years)" value={years} onChange={setYears} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="Monthly Payment" value={`$${nf(result.monthly)}`} colors={colors} />
          <ResultCard label="Total Payment" value={`$${nf(result.total)}`} colors={colors} />
          <ResultCard label="Total Interest" value={`$${nf(result.interest)}`} colors={colors} />
          <MiniChart rows={result.rows.slice(0, 120)} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  Investment Tool
// ──────────────────────────────────────────────────────────────
function InvestmentTool({ colors }: { colors: Record<string, string> }) {
  const [principal, setPrincipal] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<null | { future: number; contributed: number; gains: number }>(null);

  const calculate = () => {
    const p = parseFloat(principal) || 0;
    const c = parseFloat(monthly) || 0;
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (!n) return;
    const fvPrincipal = p * Math.pow(1 + r, n);
    const fvContrib = r > 0 ? c * ((Math.pow(1 + r, n) - 1) / r) : c * n;
    const future = fvPrincipal + fvContrib;
    const contributed = p + c * n;
    const gains = future - contributed;
    setResult({ future, contributed, gains });
  };

  return (
    <ScrollView>
      <Row label="Initial Investment ($)" value={principal} onChange={setPrincipal} colors={colors} />
      <Row label="Monthly Contribution ($)" value={monthly} onChange={setMonthly} colors={colors} />
      <Row label="Annual Return (%)" value={rate} onChange={setRate} colors={colors} />
      <Row label="Years" value={years} onChange={setYears} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="Future Value" value={`$${nf(result.future)}`} colors={colors} />
          <ResultCard label="Contributed" value={`$${nf(result.contributed)}`} colors={colors} />
          <ResultCard label="Investment Gains" value={`$${nf(result.gains)}`} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  ROI Tool
// ──────────────────────────────────────────────────────────────
function ROITool({ colors }: { colors: Record<string, string> }) {
  const [cost, setCost] = useState('');
  const [gain, setGain] = useState('');
  const [days, setDays] = useState('');
  const [result, setResult] = useState<null | { roi: number; annualRoi: number; netProfit: number }>(null);

  const calculate = () => {
    const c = parseFloat(cost);
    const g = parseFloat(gain);
    const d = parseFloat(days) || 365;
    if (!c || !g) return;
    const netProfit = g - c;
    const roi = (netProfit / c) * 100;
    const annualRoi = roi * (365 / d);
    setResult({ roi, annualRoi, netProfit });
  };

  return (
    <ScrollView>
      <Row label="Initial Cost ($)" value={cost} onChange={setCost} colors={colors} />
      <Row label="Final Value ($)" value={gain} onChange={setGain} colors={colors} />
      <Row label="Holding Period (days)" value={days} onChange={setDays} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="Net Profit" value={`$${nf(result.netProfit)}`} colors={colors} />
          <ResultCard label="ROI" value={`${nf(result.roi)}%`} colors={colors} />
          <ResultCard label="Annualized ROI" value={`${nf(result.annualRoi)}%`} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  Tax Tool
// ──────────────────────────────────────────────────────────────
const US_BRACKETS_SINGLE = [
  { max: 11000, rate: 0.10 },
  { max: 44725, rate: 0.12 },
  { max: 95375, rate: 0.22 },
  { max: 182150, rate: 0.24 },
  { max: 231250, rate: 0.32 },
  { max: 578125, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];
function TaxTool({ colors }: { colors: Record<string, string> }) {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [result, setResult] = useState<null | { taxable: number; tax: number; effective: number; marginal: number; afterTax: number }>(null);

  const calculate = () => {
    const inc = parseFloat(income) || 0;
    const ded = parseFloat(deductions) || 13850;
    const taxable = Math.max(inc - ded, 0);
    let tax = 0;
    let prev = 0;
    let marginal = 0;
    for (const bracket of US_BRACKETS_SINGLE) {
      const chunk = Math.min(taxable, bracket.max) - prev;
      if (chunk <= 0) break;
      tax += chunk * bracket.rate;
      marginal = bracket.rate;
      prev = bracket.max;
    }
    const effective = taxable > 0 ? (tax / taxable) * 100 : 0;
    const afterTax = inc - tax;
    setResult({ taxable, tax, effective, marginal: marginal * 100, afterTax });
  };

  return (
    <ScrollView>
      <Row label="Gross Income ($)" value={income} onChange={setIncome} colors={colors} />
      <Row label="Deductions ($, std=13850)" value={deductions} onChange={setDeductions} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="Taxable Income" value={`$${nf(result.taxable)}`} colors={colors} />
          <ResultCard label="Federal Tax" value={`$${nf(result.tax)}`} colors={colors} />
          <ResultCard label="Effective Rate" value={`${nf(result.effective)}%`} colors={colors} />
          <ResultCard label="Marginal Rate" value={`${nf(result.marginal)}%`} colors={colors} />
          <ResultCard label="After-Tax Income" value={`$${nf(result.afterTax)}`} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  Tip & Split Tool
// ──────────────────────────────────────────────────────────────
function TipTool({ colors }: { colors: Record<string, string> }) {
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState('18');
  const [people, setPeople] = useState('1');
  const [result, setResult] = useState<null | { tip: number; total: number; perPerson: number }>(null);

  const calculate = () => {
    const b = parseFloat(bill);
    const t = parseFloat(tipPct) / 100;
    const p = parseInt(people) || 1;
    if (!b) return;
    const tip = b * t;
    const total = b + tip;
    const perPerson = total / p;
    setResult({ tip, total, perPerson });
  };

  return (
    <ScrollView>
      <Row label="Bill Amount ($)" value={bill} onChange={setBill} colors={colors} />
      <Row label="Tip (%)" value={tipPct} onChange={setTipPct} colors={colors} />
      <Row label="Number of People" value={people} onChange={setPeople} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="Tip Amount" value={`$${nf(result.tip)}`} colors={colors} />
          <ResultCard label="Total Bill" value={`$${nf(result.total)}`} colors={colors} />
          <ResultCard label="Per Person" value={`$${nf(result.perPerson)}`} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  Discount Tool
// ──────────────────────────────────────────────────────────────
function DiscountTool({ colors }: { colors: Record<string, string> }) {
  const [original, setOriginal] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('0');
  const [result, setResult] = useState<null | { savings: number; discounted: number; final: number }>(null);

  const calculate = () => {
    const o = parseFloat(original);
    const d = parseFloat(discount) / 100;
    const t = parseFloat(tax) / 100;
    if (!o) return;
    const savings = o * d;
    const discounted = o - savings;
    const final = discounted * (1 + t);
    setResult({ savings, discounted, final });
  };

  return (
    <ScrollView>
      <Row label="Original Price ($)" value={original} onChange={setOriginal} colors={colors} />
      <Row label="Discount (%)" value={discount} onChange={setDiscount} colors={colors} />
      <Row label="Sales Tax (%)" value={tax} onChange={setTax} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="You Save" value={`$${nf(result.savings)}`} colors={colors} />
          <ResultCard label="After Discount" value={`$${nf(result.discounted)}`} colors={colors} />
          <ResultCard label="Final Price (with tax)" value={`$${nf(result.final)}`} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  Break-Even Tool
// ──────────────────────────────────────────────────────────────
function BreakEvenTool({ colors }: { colors: Record<string, string> }) {
  const [fixedCosts, setFixedCosts] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [varCostPerUnit, setVarCostPerUnit] = useState('');
  const [result, setResult] = useState<null | { units: number; revenue: number; marginPct: number }>(null);

  const calculate = () => {
    const fc = parseFloat(fixedCosts);
    const p = parseFloat(pricePerUnit);
    const vc = parseFloat(varCostPerUnit);
    if (!fc || !p || p <= vc) return;
    const units = fc / (p - vc);
    const revenue = units * p;
    const marginPct = ((p - vc) / p) * 100;
    setResult({ units, revenue, marginPct });
  };

  return (
    <ScrollView>
      <Row label="Fixed Costs ($)" value={fixedCosts} onChange={setFixedCosts} colors={colors} />
      <Row label="Selling Price/Unit ($)" value={pricePerUnit} onChange={setPricePerUnit} colors={colors} />
      <Row label="Variable Cost/Unit ($)" value={varCostPerUnit} onChange={setVarCostPerUnit} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <View>
          <ResultCard label="Break-Even Units" value={`${nf(result.units, 0)} units`} colors={colors} />
          <ResultCard label="Break-Even Revenue" value={`$${nf(result.revenue)}`} colors={colors} />
          <ResultCard label="Contribution Margin" value={`${nf(result.marginPct)}%`} colors={colors} />
        </View>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────────────────────
//  Shared sub-components
// ──────────────────────────────────────────────────────────────
function Row({
  label, value, onChange, colors,
}: { label: string; value: string; onChange: (v: string) => void; colors: Record<string, string> }) {
  return (
    <View style={[sharedStyles.rowContainer, { borderBottomColor: colors.border }]}>
      <Text style={[sharedStyles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textDisabled}
        style={[sharedStyles.rowInput, { color: colors.textPrimary }]}
        accessibilityLabel={label}
      />
    </View>
  );
}

function CalcBtn({ onPress, colors }: { onPress: () => void; colors: Record<string, string> }) {
  return (
    <Pressable
      onPress={onPress}
      style={[sharedStyles.calcBtn, { backgroundColor: colors.accentPrimary }]}
      accessibilityRole="button"
      accessibilityLabel="Calculate"
    >
      <Text style={sharedStyles.calcBtnLabel}>Calculate</Text>
    </Pressable>
  );
}

function ResultCard({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={[sharedStyles.resultCard, { backgroundColor: colors.bgSurface }]}>
      <Text style={[sharedStyles.resultLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[sharedStyles.resultValue, { color: colors.accentPrimary }]}>{value}</Text>
    </View>
  );
}

function MiniChart({ rows, colors }: { rows: { period: number; balance: number }[]; colors: Record<string, string> }) {
  if (!rows.length) return null;
  const W = 300;
  const H = 120;
  const maxB = rows[0].balance;
  const points = rows
    .map((r, i) => {
      const x = (i / (rows.length - 1)) * W;
      const y = H - (r.balance / maxB) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <View style={sharedStyles.chartContainer}>
      <Text style={[sharedStyles.chartTitle, { color: colors.textSecondary }]}>Balance Over Time</Text>
      <Svg width={W} height={H}>
        <Line x1={0} y1={H} x2={W} y2={H} stroke={colors.border} strokeWidth={1} />
        <Polyline points={points} fill="none" stroke={colors.accentPrimary} strokeWidth={2} />
      </Svg>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Main Screen
// ──────────────────────────────────────────────────────────────
export function FinancialCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<FinTab>('Loan');

  const renderTool = () => {
    switch (activeTab) {
      case 'Loan': return <LoanTool colors={colors as Record<string, string>} />;
      case 'Investment': return <InvestmentTool colors={colors as Record<string, string>} />;
      case 'ROI': return <ROITool colors={colors as Record<string, string>} />;
      case 'Tax': return <TaxTool colors={colors as Record<string, string>} />;
      case 'Tip': return <TipTool colors={colors as Record<string, string>} />;
      case 'Discount': return <DiscountTool colors={colors as Record<string, string>} />;
      case 'BreakEven': return <BreakEvenTool colors={colors as Record<string, string>} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Financial</Text>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, { backgroundColor: activeTab === tab ? colors.accentPrimary : colors.bgSurface }]}
            accessibilityRole="tab"
            accessibilityLabel={tab}
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[styles.tabLabel, { color: activeTab === tab ? '#FFF' : colors.textSecondary }]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.toolContainer}>{renderTool()}</View>
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
  toolContainer: { flex: 1 },
});

const sharedStyles = StyleSheet.create({
  rowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 14, flex: 1 },
  rowInput: { fontSize: 16, textAlign: 'right', minWidth: 120 },
  calcBtn: { marginHorizontal: 16, marginTop: 20, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  calcBtnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  resultCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLabel: { fontSize: 13 },
  resultValue: { fontSize: 22, fontWeight: '700' },
  chartContainer: { marginHorizontal: 16, marginTop: 16, alignItems: 'center' },
  chartTitle: { fontSize: 12, marginBottom: 8 },
});
