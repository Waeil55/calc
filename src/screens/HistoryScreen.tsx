import React, { useState, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/hooks/useTheme';
import { useHistoryStore } from '@/store/historyStore';
import { exportHistory } from '@/utils/exportUtils';
import { HistoryCard } from '@/components/history/HistoryCard';
import type { HistoryEntry, CalcModule } from '@/types';

type Filter = 'all' | 'favorites' | CalcModule;
type SortKey = 'newest' | 'oldest' | 'module';

const MODULE_OPTIONS: CalcModule[] = [
  'basic', 'scientific', 'graphing', 'financial', 'currency',
  'unit', 'programmer', 'statistics', 'matrix', 'equation', 'datetime', 'health',
];

export function HistoryScreen() {
  const { colors } = useTheme();
  const { entries, deleteEntry, toggleFavorite, clearAll, searchEntries } = useHistoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);

  const getFilteredEntries = useCallback((): HistoryEntry[] => {
    let result = searchQuery.trim() ? searchEntries(searchQuery) : [...entries];

    if (filter === 'favorites') {
      result = result.filter((e) => e.isFavorited);
    } else if (filter !== 'all') {
      result = result.filter((e) => e.module === filter);
    }

    switch (sort) {
      case 'newest': result.sort((a, b) => b.timestamp - a.timestamp); break;
      case 'oldest': result.sort((a, b) => a.timestamp - b.timestamp); break;
      case 'module': result.sort((a, b) => a.module.localeCompare(b.module)); break;
    }

    return result;
  }, [entries, searchQuery, filter, sort, searchEntries]);

  const displayedEntries = getFilteredEntries();

  const handleDelete = (id: string) => {
    deleteEntry(id);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all history entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAll },
      ]
    );
  };

  const handleExport = async () => {
    try {
      await exportHistory(entries);
    } catch {
      Alert.alert('Export Failed', 'Could not export history.');
    }
  };

  const toggleSelectEntry = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    Alert.alert(
      'Delete Selected',
      `Delete ${selectedIds.size} entries?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => deleteEntry(id));
            setSelectedIds(new Set());
            setBatchMode(false);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <HistoryCard
      entry={item}
      onPress={batchMode ? () => toggleSelectEntry(item.id) : undefined}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No History Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Your calculations will appear here once you start using the calculator.
      </Text>
    </View>
  );

  // Group by date for section headers
  const getDateHeader = (timestamp: number): string => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>History</Text>
        <View style={styles.headerActions}>
          {batchMode ? (
            <>
              <Pressable onPress={deleteSelected} style={[styles.headerBtn, { backgroundColor: '#FF5A5A22' }]} accessibilityRole="button" accessibilityLabel="Delete selected">
                <Text style={[styles.headerBtnLabel, { color: '#FF5A5A' }]}>Delete ({selectedIds.size})</Text>
              </Pressable>
              <Pressable onPress={() => { setBatchMode(false); setSelectedIds(new Set()); }} style={[styles.headerBtn, { backgroundColor: colors.bgSurface }]} accessibilityRole="button" accessibilityLabel="Cancel batch">
                <Text style={[styles.headerBtnLabel, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={handleExport} style={[styles.headerBtn, { backgroundColor: colors.bgSurface }]} accessibilityRole="button" accessibilityLabel="Export history">
                <Text style={[styles.headerBtnLabel, { color: colors.textSecondary }]}>Export</Text>
              </Pressable>
              <Pressable onPress={() => setBatchMode(true)} style={[styles.headerBtn, { backgroundColor: colors.bgSurface }]} accessibilityRole="button" accessibilityLabel="Select entries">
                <Text style={[styles.headerBtnLabel, { color: colors.textSecondary }]}>Select</Text>
              </Pressable>
              <Pressable onPress={handleClearAll} style={[styles.headerBtn, { backgroundColor: '#FF5A5A22' }]} accessibilityRole="button" accessibilityLabel="Clear all history">
                <Text style={[styles.headerBtnLabel, { color: '#FF5A5A' }]}>Clear All</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.bgSurface }]}>
        <Text style={[styles.searchIcon, { color: colors.textDisabled }]}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search history..."
          placeholderTextColor={colors.textDisabled}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          accessibilityLabel="Search history"
          returnKeyType="search"
        />
        {!!searchQuery && (
          <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Text style={[styles.clearSearch, { color: colors.textDisabled }]}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filter row */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setShowFilters((v) => !v)}
          style={[styles.filterToggle, { backgroundColor: showFilters ? colors.accentPrimary : colors.bgSurface }]}
          accessibilityRole="button"
          accessibilityLabel="Toggle filters"
        >
          <Text style={[styles.filterToggleLabel, { color: showFilters ? '#FFF' : colors.textSecondary }]}>
            Filters ▾
          </Text>
        </Pressable>

        {/* Sort options */}
        <View style={styles.sortRow}>
          {(['newest', 'oldest', 'module'] as SortKey[]).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSort(s)}
              style={[styles.sortBtn, { backgroundColor: sort === s ? colors.accentPrimary : colors.bgSurface }]}
              accessibilityRole="button"
              accessibilityLabel={s}
              accessibilityState={{ selected: sort === s }}
            >
              <Text style={[styles.sortLabel, { color: sort === s ? '#FFF' : colors.textSecondary }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Filter chips */}
      {showFilters && (
        <View style={styles.filterChips}>
          {(['all', 'favorites', ...MODULE_OPTIONS] as Filter[]).map((f) => (
            <Pressable
              key={String(f)}
              onPress={() => setFilter(f)}
              style={[styles.chip, { backgroundColor: filter === f ? colors.accentPrimary : colors.bgSurface }]}
              accessibilityRole="button"
              accessibilityLabel={String(f)}
              accessibilityState={{ selected: filter === f }}
            >
              <Text style={[styles.chipLabel, { color: filter === f ? '#FFF' : colors.textSecondary }]}>
                {f === 'all' ? '⭐ All' : f === 'favorites' ? '★ Favorites' : String(f)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.bgSurface }]}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {displayedEntries.length} of {entries.length} entries
          {entries.filter((e) => e.isFavorited).length > 0 && ` · ${entries.filter((e) => e.isFavorited).length} favorites`}
        </Text>
      </View>

      {/* List */}
      <FlashList
        data={displayedEntries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 8 },
  title: { fontSize: 28, fontWeight: '800', flex: 1 },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerBtn: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  headerBtnLabel: { fontSize: 13, fontWeight: '600' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, marginHorizontal: 16, marginVertical: 8, paddingHorizontal: 12, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  clearSearch: { fontSize: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  filterToggle: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  filterToggleLabel: { fontSize: 13, fontWeight: '600' },
  sortRow: { flexDirection: 'row', gap: 6, flex: 1 },
  sortBtn: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  sortLabel: { fontSize: 12, fontWeight: '600' },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  statsBar: { marginHorizontal: 16, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
  statsText: { fontSize: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
});
