import React, { useState, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SectionList,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { UNIT_CATEGORIES, convertUnit } from '@/utils/constants';
import type { ConversionCategory, ConversionUnit } from '@/types';

type Favorite = { category: string; fromUnit: string; toUnit: string };

export function UnitConverterScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<ConversionCategory>(UNIT_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState<ConversionUnit>(UNIT_CATEGORIES[0].units[0]);
  const [toUnit, setToUnit] = useState<ConversionUnit>(
    UNIT_CATEGORIES[0].units[1] ?? UNIT_CATEGORIES[0].units[0]
  );
  const [inputValue, setInputValue] = useState('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const outputValue = useCallback((): string => {
    const n = parseFloat(inputValue);
    if (isNaN(n)) return '—';
    try {
      const result = convertUnit(n, fromUnit, toUnit);
      if (typeof result === 'string') return result;
      return Number.isInteger(result) ? String(result) : result.toPrecision(10).replace(/\.?0+$/, '');
    } catch {
      return 'Error';
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(outputValue());
  };

  const selectCategory = (cat: ConversionCategory) => {
    setSelectedCategory(cat);
    setFromUnit(cat.units[0]);
    setToUnit(cat.units[1] ?? cat.units[0]);
    setInputValue('');
  };

  const toggleFavorite = () => {
    const key: Favorite = { category: selectedCategory.name, fromUnit: fromUnit.id, toUnit: toUnit.id };
    setFavorites((prev) => {
      const idx = prev.findIndex((f) => f.category === key.category && f.fromUnit === key.fromUnit && f.toUnit === key.toUnit);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, key];
    });
  };

  const isFavorite = favorites.some(
    (f) => f.category === selectedCategory.name && f.fromUnit === fromUnit.id && f.toUnit === toUnit.id
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Unit Converter</Text>
        <Pressable onPress={toggleFavorite} style={styles.favBtn} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <Text style={{ fontSize: 22 }}>{isFavorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Category list */}
        <ScrollView style={[styles.categoryList, { borderRightColor: colors.border }]} showsVerticalScrollIndicator={false}>
          {UNIT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.name}
              onPress={() => selectCategory(cat)}
              style={[styles.catItem, { backgroundColor: selectedCategory.name === cat.name ? colors.accentPrimary + '22' : 'transparent' }]}
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              accessibilityState={{ selected: selectedCategory.name === cat.name }}
            >
              <Text style={[styles.catIcon]}>{cat.icon ?? '⚖️'}</Text>
              <Text style={[styles.catLabel, { color: selectedCategory.name === cat.name ? colors.accentPrimary : colors.textSecondary }]}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Right panel */}
        <View style={styles.panel}>
          {/* Conversion panel */}
          <View style={[styles.conversionCard, { backgroundColor: colors.bgSurface }]}>
            {/* From */}
            <Text style={[styles.panelLabel, { color: colors.textSecondary }]}>From</Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textDisabled}
              style={[styles.valueInput, { color: colors.textPrimary, borderBottomColor: colors.border }]}
              accessibilityLabel={`Value in ${fromUnit.name}`}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
              {selectedCategory.units.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => setFromUnit(u)}
                  style={[styles.unitChip, { backgroundColor: fromUnit.id === u.id ? colors.accentPrimary : colors.bgMuted }]}
                  accessibilityRole="button"
                  accessibilityLabel={u.name}
                  accessibilityState={{ selected: fromUnit.id === u.id }}
                >
                  <Text style={[styles.unitChipLabel, { color: fromUnit.id === u.id ? '#FFF' : colors.textSecondary }]}>{u.symbol ?? u.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Swap */}
            <Pressable onPress={swapUnits} style={[styles.swapBtn, { borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Swap units">
              <Text style={[styles.swapLabel, { color: colors.accentPrimary }]}>⇅ Swap</Text>
            </Pressable>

            {/* To */}
            <Text style={[styles.panelLabel, { color: colors.textSecondary }]}>To</Text>
            <Text style={[styles.resultValue, { color: colors.accentPrimary }]}>{outputValue()}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
              {selectedCategory.units.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => setToUnit(u)}
                  style={[styles.unitChip, { backgroundColor: toUnit.id === u.id ? colors.accentPrimary : colors.bgMuted }]}
                  accessibilityRole="button"
                  accessibilityLabel={u.name}
                  accessibilityState={{ selected: toUnit.id === u.id }}
                >
                  <Text style={[styles.unitChipLabel, { color: toUnit.id === u.id ? '#FFF' : colors.textSecondary }]}>{u.symbol ?? u.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Info: conversion formula */}
          <Text style={[styles.formulaHint, { color: colors.textDisabled }]}>
            1 {fromUnit.name} = {(() => {
              try { return convertUnit(1, fromUnit, toUnit); } catch { return '?'; }
            })()} {toUnit.name}
          </Text>

          {/* Favorites */}
          {favorites.length > 0 && (
            <>
              <Text style={[styles.favTitle, { color: colors.textSecondary }]}>Favorites</Text>
              {favorites.map((fav) => {
                const cat = UNIT_CATEGORIES.find((c) => c.name === fav.category);
                const fu = cat?.units.find((u) => u.id === fav.fromUnit);
                const tu = cat?.units.find((u) => u.id === fav.toUnit);
                if (!cat || !fu || !tu) return null;
                return (
                  <Pressable
                    key={`${fav.category}-${fav.fromUnit}-${fav.toUnit}`}
                    onPress={() => { selectCategory(cat); setFromUnit(fu); setToUnit(tu); }}
                    style={[styles.favItem, { backgroundColor: colors.bgSurface }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${fu.name} to ${tu.name}`}
                  >
                    <Text style={[styles.favItemLabel, { color: colors.textPrimary }]}>{fu.symbol ?? fu.name} → {tu.symbol ?? tu.name}</Text>
                    <Text style={[styles.favItemCat, { color: colors.textSecondary }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  favBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' },
  body: { flex: 1, flexDirection: 'row' },
  categoryList: { width: 100, borderRightWidth: 1 },
  catItem: { flexDirection: 'column', alignItems: 'center', padding: 12, gap: 4 },
  catIcon: { fontSize: 20 },
  catLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },
  panel: { flex: 1, padding: 16, gap: 12 },
  conversionCard: { borderRadius: 20, padding: 16, gap: 12 },
  panelLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  valueInput: { fontSize: 36, fontWeight: '300', borderBottomWidth: 1, paddingBottom: 4, marginBottom: 4 },
  unitScroll: { maxHeight: 44 },
  unitChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  unitChipLabel: { fontSize: 13, fontWeight: '600' },
  swapBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 8, alignItems: 'center' },
  swapLabel: { fontSize: 15, fontWeight: '600' },
  resultValue: { fontSize: 36, fontWeight: '300' },
  formulaHint: { fontSize: 12, textAlign: 'center' },
  favTitle: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  favItem: { borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  favItemLabel: { fontSize: 14, fontWeight: '500' },
  favItemCat: { fontSize: 12 },
});
