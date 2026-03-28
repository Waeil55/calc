import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Svg, { Polyline, Line } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useCurrencyStore } from '@/store/currencyStore';
import { useSettingsStore } from '@/store/settingsStore';

const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
const MAX_ROWS = 6;

interface CurrencyRow { code: string; value: string; }

export function CurrencyConverterScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const { currencies, rates, lastUpdated, fetchRates, getCachedRate } = useCurrencyStore();
  const baseCurrency = useSettingsStore((s) => s.baseCurrency);

  const [rows, setRows] = useState<CurrencyRow[]>(
    POPULAR.slice(0, MAX_ROWS).map((code) => ({ code, value: code === baseCurrency ? '1' : '' }))
  );
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!lastUpdated) {
      setLoading(true);
      fetchRates().finally(() => setLoading(false));
    }
  }, []);

  const convertFromBase = useCallback(
    (amount: number, targetCode: string): string => {
      if (targetCode === baseCurrency) return String(amount);
      try {
        const rate = getCachedRate(baseCurrency, targetCode);
        if (!rate) return '—';
        return (amount * rate).toFixed(4);
      } catch {
        return '—';
      }
    },
    [baseCurrency, getCachedRate]
  );

  const recalcFromRow = (idx: number, raw: string) => {
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed < 0) {
      setRows((prev) => prev.map((r, i) => ({ ...r, value: i === idx ? raw : '' })));
      return;
    }
    const sourceCode = rows[idx].code;
    // Convert to base first
    const toBase = sourceCode === baseCurrency ? parsed : (() => {
      const rate = getCachedRate(sourceCode, baseCurrency);
      return rate ? parsed * rate : null;
    })();
    if (toBase === null) return;

    setRows((prev) =>
      prev.map((r, i) => {
        if (i === idx) return { ...r, value: raw };
        if (r.code === baseCurrency) return { ...r, value: toBase.toFixed(4) };
        const rate = getCachedRate(baseCurrency, r.code);
        return { ...r, value: rate ? (toBase * rate).toFixed(4) : '—' };
      })
    );
  };

  const openPicker = (idx: number) => {
    setPickerIndex(idx);
    setSearch('');
    setShowPicker(true);
  };

  const selectCurrency = (code: string) => {
    setRows((prev) => prev.map((r, i) => (i === pickerIndex ? { code, value: '' } : r)));
    setShowPicker(false);
  };

  const filteredCurrencies = currencies.filter(
    (c) => c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const timeSinceUpdate = lastUpdated
    ? `Updated ${Math.round((Date.now() - lastUpdated) / 60000)} min ago`
    : 'Rates not loaded';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Currency</Text>
        <Pressable
          onPress={() => { setLoading(true); fetchRates().finally(() => setLoading(false)); }}
          style={styles.refreshBtn}
          accessibilityRole="button"
          accessibilityLabel="Refresh rates"
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.accentPrimary} />
          ) : (
            <Text style={[styles.refreshLabel, { color: colors.accentPrimary }]}>↻</Text>
          )}
        </Pressable>
      </View>

      {/* Offline / stale notice */}
      {!lastUpdated && (
        <View style={[styles.notice, { backgroundColor: colors.bgMuted }]}>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>Offline mode — tap ↻ to fetch live rates</Text>
        </View>
      )}

      {/* Currency rows */}
      <ScrollView style={styles.rowsContainer}>
        {rows.map((row, idx) => {
          const currency = currencies.find((c) => c.code === row.code);
          return (
            <View key={idx} style={[styles.currencyRow, { backgroundColor: colors.bgSurface, borderLeftColor: idx === activeIndex ? colors.accentPrimary : 'transparent' }]}>
              <Pressable onPress={() => openPicker(idx)} accessibilityRole="button" accessibilityLabel={`Change currency for row ${idx + 1}`} style={styles.flagCode}>
                <Text style={styles.flag}>{currency?.flag ?? '🌍'}</Text>
                <View>
                  <Text style={[styles.codeLabel, { color: colors.textPrimary }]}>{row.code}</Text>
                  <Text style={[styles.nameLabel, { color: colors.textSecondary }]} numberOfLines={1}>{currency?.name ?? ''}</Text>
                </View>
              </Pressable>
              <TextInput
                value={row.value}
                onChangeText={(t) => { setActiveIndex(idx); recalcFromRow(idx, t); }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textDisabled}
                style={[styles.amountInput, { color: colors.textPrimary }]}
                accessibilityLabel={`${row.code} amount`}
              />
            </View>
          );
        })}

        <Text style={[styles.updateHint, { color: colors.textDisabled }]}>{timeSinceUpdate}</Text>

        {/* Mini sparkline placeholder */}
        <View style={[styles.sparklineCard, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.sparkTitle, { color: colors.textSecondary }]}>
            Exchange Rate Trend (simulated)
          </Text>
          <Svg width={280} height={60}>
            <Polyline
              points="0,50 40,40 80,45 120,20 160,30 200,15 240,25 280,10"
              fill="none"
              stroke={colors.accentPrimary}
              strokeWidth={2}
            />
            <Line x1={0} y1={60} x2={280} y2={60} stroke={colors.border} strokeWidth={1} />
          </Svg>
        </View>
      </ScrollView>

      {/* Currency picker modal */}
      {showPicker && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100 }]}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.bgSurface }]}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search currency..."
              placeholderTextColor={colors.textDisabled}
              style={[styles.searchInput, { color: colors.textPrimary, borderColor: colors.border }]}
              autoFocus
              accessibilityLabel="Search currencies"
            />
            <ScrollView>
              {filteredCurrencies.map((c) => (
                <Pressable key={c.code} onPress={() => selectCurrency(c.code)} style={styles.pickerItem} accessibilityRole="button" accessibilityLabel={`${c.code} ${c.name}`}>
                  <Text style={styles.pickerFlag}>{c.flag ?? '🌍'}</Text>
                  <Text style={[styles.pickerCode, { color: colors.textPrimary }]}>{c.code}</Text>
                  <Text style={[styles.pickerName, { color: colors.textSecondary }]}>{c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setShowPicker(false)} style={[styles.cancelBtn, { borderTopColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={[styles.cancelLabel, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  refreshBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  refreshLabel: { fontSize: 24 },
  notice: { marginHorizontal: 16, borderRadius: 12, padding: 10, marginTop: 8 },
  noticeText: { fontSize: 13, textAlign: 'center' },
  rowsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  flagCode: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
  flag: { fontSize: 28 },
  codeLabel: { fontSize: 16, fontWeight: '700' },
  nameLabel: { fontSize: 12 },
  amountInput: { fontSize: 22, fontWeight: '300', textAlign: 'right', flex: 1 },
  updateHint: { fontSize: 12, textAlign: 'center', marginVertical: 8 },
  sparklineCard: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  sparkTitle: { fontSize: 12, marginBottom: 8 },
  pickerSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingTop: 16 },
  searchInput: { marginHorizontal: 16, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 8 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  pickerFlag: { fontSize: 22 },
  pickerCode: { fontSize: 15, fontWeight: '700', width: 48 },
  pickerName: { fontSize: 14, flex: 1 },
  cancelBtn: { paddingVertical: 16, alignItems: 'center', borderTopWidth: 1 },
  cancelLabel: { fontSize: 16 },
});
