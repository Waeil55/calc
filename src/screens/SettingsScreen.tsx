import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  Switch,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { useHistoryStore } from '@/store/historyStore';
import type { ThemeMode, AccentColor, HapticLevel, FontSize } from '@/types';

const ACCENT_OPTIONS: { id: AccentColor; color: string; label: string }[] = [
  { id: 'indigo', color: '#6C63FF', label: 'Indigo' },
  { id: 'cyan', color: '#00D4FF', label: 'Cyan' },
  { id: 'emerald', color: '#00E5A0', label: 'Emerald' },
  { id: 'amber', color: '#FFB547', label: 'Amber' },
  { id: 'rose', color: '#FF6B9D', label: 'Rose' },
  { id: 'violet', color: '#8B5CF6', label: 'Violet' },
];

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'system', label: 'System', icon: '📱' },
];

const HAPTIC_OPTIONS: { id: HapticLevel; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'strong', label: 'Strong' },
];

const FONT_SIZE_OPTIONS: { id: FontSize; label: string; size: number }[] = [
  { id: 'sm', label: 'S', size: 12 },
  { id: 'md', label: 'M', size: 14 },
  { id: 'lg', label: 'L', size: 16 },
  { id: 'xl', label: 'XL', size: 18 },
];

const PRECISION_OPTIONS = [2, 4, 6, 8, 10, 12] as const;
const RETENTION_OPTIONS: { id: 30 | 90 | 365 | 0; label: string }[] = [
  { id: 30, label: '30 Days' },
  { id: 90, label: '90 Days' },
  { id: 365, label: '1 Year' },
  { id: 0, label: 'Forever' },
];

function SectionHeader({ title, colors }: { title: string; colors: Record<string, string> }) {
  return <Text style={[shStyles.header, { color: colors.textDisabled }]}>{title}</Text>;
}
const shStyles = StyleSheet.create({ header: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 4, paddingHorizontal: 16 } });

function SettingRow({ label, subtitle, right, colors }: { label: string; subtitle?: string; right: React.ReactNode; colors: Record<string, string> }) {
  return (
    <View style={[sRowStyles.row, { backgroundColor: colors.bgSurface, borderBottomColor: colors.border }]}>
      <View style={sRowStyles.left}>
        <Text style={[sRowStyles.label, { color: colors.textPrimary }]}>{label}</Text>
        {subtitle && <Text style={[sRowStyles.subtitle, { color: colors.textDisabled }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
const sRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  left: { flex: 1, gap: 2 },
  label: { fontSize: 15 },
  subtitle: { fontSize: 12 },
});

export function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useSettingsStore();
  const { clearAll } = useHistoryStore();

  const confirmClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAll },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Settings</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Appearance ── */}
        <SectionHeader title="Appearance" colors={colors as Record<string, string>} />

        {/* Theme */}
        <View style={[styles.optionGroup, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Theme</Text>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => settings.setTheme(t.id)}
                style={[styles.optionBtn, { backgroundColor: settings.theme === t.id ? colors.accentPrimary : colors.bgMuted }]}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: settings.theme === t.id }}
              >
                <Text style={styles.optionIcon}>{t.icon}</Text>
                <Text style={[styles.optionLabel, { color: settings.theme === t.id ? '#FFF' : colors.textSecondary }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Accent color */}
        <View style={[styles.optionGroup, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Accent Color</Text>
          <View style={styles.colorRow}>
            {ACCENT_OPTIONS.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => settings.setAccentColor(a.id)}
                style={[styles.colorSwatch, { backgroundColor: a.color, borderWidth: settings.accentColor === a.id ? 3 : 0, borderColor: '#FFF' }]}
                accessibilityRole="button"
                accessibilityLabel={`${a.label} accent`}
                accessibilityState={{ selected: settings.accentColor === a.id }}
              />
            ))}
          </View>
        </View>

        {/* Font size */}
        <View style={[styles.optionGroup, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Font Size</Text>
          <View style={styles.optionRow}>
            {FONT_SIZE_OPTIONS.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => settings.setFontSize(f.id)}
                style={[styles.optionBtn, { backgroundColor: settings.fontSize === f.id ? colors.accentPrimary : colors.bgMuted }]}
                accessibilityRole="button"
                accessibilityLabel={`Font size ${f.label}`}
                accessibilityState={{ selected: settings.fontSize === f.id }}
              >
                <Text style={[styles.optionLabel, { fontSize: f.size, color: settings.fontSize === f.id ? '#FFF' : colors.textSecondary }]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Calculator ── */}
        <SectionHeader title="Calculator" colors={colors as Record<string, string>} />

        {/* Precision */}
        <View style={[styles.optionGroup, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Decimal Precision</Text>
          <View style={styles.optionRow}>
            {PRECISION_OPTIONS.map((p) => (
              <Pressable
                key={p}
                onPress={() => settings.setPrecision(p)}
                style={[styles.precisionBtn, { backgroundColor: settings.precision === p ? colors.accentPrimary : colors.bgMuted }]}
                accessibilityRole="button"
                accessibilityLabel={`${p} decimal places`}
                accessibilityState={{ selected: settings.precision === p }}
              >
                <Text style={[styles.precisionLabel, { color: settings.precision === p ? '#FFF' : colors.textSecondary }]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <SettingRow
          label="Thousands Separator"
          subtitle="Format: 1,000,000"
          colors={colors as Record<string, string>}
          right={
            <Switch
              value={settings.thousandsSeparator}
              onValueChange={settings.setThousandsSeparator}
              accessibilityLabel="Thousands separator"
            />
          }
        />

        <SettingRow
          label="Auto-Save Calculations"
          subtitle="Save to history automatically"
          colors={colors as Record<string, string>}
          right={
            <Switch
              value={settings.autoSave === 'always'}
              onValueChange={(v) => settings.setAutoSave(v ? 'always' : 'never')}
              accessibilityLabel="Auto-save calculations"
            />
          }
        />

        <SettingRow
          label="Clear on New Session"
          colors={colors as Record<string, string>}
          right={
            <Switch
              value={settings.clearOnNewSession}
              onValueChange={settings.setClearOnNewSession}
              accessibilityLabel="Clear on new session"
            />
          }
        />

        {/* ── Feedback ── */}
        <SectionHeader title="Feedback" colors={colors as Record<string, string>} />

        {/* Haptic level */}
        <View style={[styles.optionGroup, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Haptic Feedback</Text>
          <View style={styles.optionRow}>
            {HAPTIC_OPTIONS.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => settings.setHapticLevel(h.id)}
                style={[styles.optionBtn, { backgroundColor: settings.hapticLevel === h.id ? colors.accentPrimary : colors.bgMuted }]}
                accessibilityRole="button"
                accessibilityLabel={h.label}
                accessibilityState={{ selected: settings.hapticLevel === h.id }}
              >
                <Text style={[styles.optionLabel, { color: settings.hapticLevel === h.id ? '#FFF' : colors.textSecondary }]}>{h.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <SettingRow
          label="Sound Effects"
          colors={colors as Record<string, string>}
          right={
            <Switch
              value={settings.soundEnabled}
              onValueChange={settings.setSoundEnabled}
              accessibilityLabel="Sound effects"
            />
          }
        />

        {/* ── Currency ── */}
        <SectionHeader title="Currency" colors={colors as Record<string, string>} />
        <SettingRow
          label="Auto-Update Rates"
          subtitle="Fetches rates on app open"
          colors={colors as Record<string, string>}
          right={
            <Switch
              value={settings.currencyAutoUpdate !== 'manual'}
              onValueChange={(v) => settings.setCurrencyAutoUpdate(v ? 'wifi' : 'manual')}
              accessibilityLabel="Auto-update currency rates"
            />
          }
        />

        {/* ── History ── */}
        <SectionHeader title="History" colors={colors as Record<string, string>} />
        <View style={[styles.optionGroup, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Keep History For</Text>
          <View style={styles.optionRow}>
            {RETENTION_OPTIONS.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => settings.setHistoryRetention(r.id)}
                style={[styles.optionBtn, { backgroundColor: settings.historyRetention === r.id ? colors.accentPrimary : colors.bgMuted, flex: 1 }]}
                accessibilityRole="button"
                accessibilityLabel={r.label}
                accessibilityState={{ selected: settings.historyRetention === r.id }}
              >
                <Text style={[styles.optionLabel, { color: settings.historyRetention === r.id ? '#FFF' : colors.textSecondary, textAlign: 'center' }]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={confirmClearHistory}
          style={[styles.dangerBtn, { backgroundColor: '#FF5A5A22' }]}
          accessibilityRole="button"
          accessibilityLabel="Clear all history"
        >
          <Text style={styles.dangerBtnLabel}>🗑 Clear All History</Text>
        </Pressable>

        {/* ── About ── */}
        <SectionHeader title="About" colors={colors as Record<string, string>} />
        <View style={[styles.aboutCard, { backgroundColor: colors.bgSurface }]}>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>CalcPro Enterprise</Text>
          <Text style={[styles.version, { color: colors.textDisabled }]}>Version 1.0.0</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            A professional calculator suite with 10 specialized modules, full history, and beautiful design.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  content: { paddingBottom: 120 },
  optionGroup: { marginHorizontal: 16, borderRadius: 16, padding: 14, gap: 10 },
  groupLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 4 },
  optionIcon: { fontSize: 16 },
  optionLabel: { fontSize: 12, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 14, paddingVertical: 4 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  precisionBtn: { width: 44, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  precisionLabel: { fontSize: 14, fontWeight: '700' },
  dangerBtn: { marginHorizontal: 16, marginTop: 8, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  dangerBtnLabel: { fontSize: 15, fontWeight: '600', color: '#FF5A5A' },
  aboutCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, gap: 4 },
  appName: { fontSize: 18, fontWeight: '700' },
  version: { fontSize: 13 },
  aboutText: { fontSize: 13, lineHeight: 20 },
  spacer: { height: 40 },
});
