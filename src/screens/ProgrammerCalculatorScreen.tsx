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
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

type Base = 'DEC' | 'HEX' | 'OCT' | 'BIN';
type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT';

const BASES: Base[] = ['DEC', 'HEX', 'OCT', 'BIN'];

function toBigInt(value: string, base: Base): bigint | null {
  try {
    const radixMap: Record<Base, number> = { DEC: 10, HEX: 16, OCT: 8, BIN: 2 };
    const cleaned = value.replace(/\s/g, '');
    if (!cleaned) return null;
    return BigInt(parseInt(cleaned, radixMap[base]));
  } catch {
    return null;
  }
}

function fromBigInt(n: bigint, base: Base, bits = 64): string {
  const mask = (1n << BigInt(bits)) - 1n;
  const masked = n & mask;
  switch (base) {
    case 'DEC': return masked.toString(10);
    case 'HEX': return masked.toString(16).toUpperCase();
    case 'OCT': return masked.toString(8);
    case 'BIN': {
      const raw = masked.toString(2);
      // pad to multiple of 4
      const padded = raw.padStart(Math.ceil(raw.length / 4) * 4, '0');
      return padded.replace(/(.{4})/g, '$1 ').trim();
    }
  }
}

function applyBitwise(a: bigint, b: bigint, op: BitwiseOp): bigint {
  switch (op) {
    case 'AND': return a & b;
    case 'OR': return a | b;
    case 'XOR': return a ^ b;
    case 'NOT': return ~a;
    case 'LSHIFT': return a << b;
    case 'RSHIFT': return a >> b;
    default: return a;
  }
}

// ──────────────────────────────────────────────────────────────
//  Hex keypad buttons for each base
// ──────────────────────────────────────────────────────────────
const HEX_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ProgrammerCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const { trigger } = useHaptics();

  const [inputBase, setInputBase] = useState<Base>('DEC');
  const [inputValue, setInputValue] = useState('');
  const [bitwiseA, setBitwiseA] = useState('');
  const [bitwiseB, setBitwiseB] = useState('');
  const [bitwiseOp, setBitwiseOp] = useState<BitwiseOp>('AND');
  const [bitwiseResult, setBitwiseResult] = useState<string>('');
  const [bits, setBits] = useState<8 | 16 | 32 | 64>(64);
  const [activeTab, setActiveTab] = useState<'convert' | 'bitwise' | 'ascii' | 'color'>('convert');

  // Derived conversions
  const bigVal = toBigInt(inputValue, inputBase);
  const dec = bigVal !== null ? fromBigInt(bigVal, 'DEC', bits) : '—';
  const hex = bigVal !== null ? fromBigInt(bigVal, 'HEX', bits) : '—';
  const oct = bigVal !== null ? fromBigInt(bigVal, 'OCT', bits) : '—';
  const bin = bigVal !== null ? fromBigInt(bigVal, 'BIN', bits) : '—';

  const computeBitwise = () => {
    const a = toBigInt(bitwiseA, inputBase);
    const b = toBigInt(bitwiseB, inputBase);
    if (a === null) return;
    const bVal = bitwiseOp === 'NOT' ? 0n : (b ?? 0n);
    const result = applyBitwise(a, bVal, bitwiseOp);
    setBitwiseResult(fromBigInt(result, inputBase, bits));
  };

  // ASCII lookup
  const [asciiInput, setAsciiInput] = useState('');
  const asciiDec = asciiInput ? asciiInput.charCodeAt(0) : null;
  const asciiHex = asciiDec !== null ? asciiDec.toString(16).toUpperCase() : null;
  const asciiBin = asciiDec !== null ? asciiDec.toString(2).padStart(8, '0') : null;

  // Color converter
  const [hexColor, setHexColor] = useState('');
  const parseHexToRgb = () => {
    const c = hexColor.replace('#', '');
    if (c.length !== 6) return null;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return { r, g, b };
  };
  const rgb = parseHexToRgb();
  const hexColorResult = rgb
    ? `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: ${(() => {
        const r = rgb.r / 255, g = rgb.g / 255, bv = rgb.b / 255;
        const max = Math.max(r, g, bv), min = Math.min(r, g, bv);
        const l = (max + min) / 2;
        if (max === min) return `0°, 0%, ${(l * 100).toFixed(0)}%`;
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let h = 0;
        if (max === r) h = (g - bv) / d + (g < bv ? 6 : 0);
        else if (max === g) h = (bv - r) / d + 2;
        else h = (r - g) / d + 4;
        return `${(h * 60).toFixed(0)}°, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%`;
      })()}`
    : '';

  const TABS = ['convert', 'bitwise', 'ascii', 'color'] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Programmer</Text>
        {/* Bit-width selector */}
        {([8, 16, 32, 64] as const).map((b) => (
          <Pressable key={b} onPress={() => setBits(b)} style={[styles.bitBtn, { backgroundColor: bits === b ? colors.accentPrimary : colors.bgMuted }]} accessibilityRole="button" accessibilityLabel={`${b} bits`}>
            <Text style={[styles.bitLabel, { color: bits === b ? '#FFF' : colors.textSecondary }]}>{b}</Text>
          </Pressable>
        ))}
      </View>

      {/* Sub-tab bar */}
      <View style={[styles.subTabBar, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.subTab, { borderBottomColor: activeTab === tab ? colors.accentPrimary : 'transparent', borderBottomWidth: 2 }]} accessibilityRole="tab" accessibilityLabel={tab} accessibilityState={{ selected: activeTab === tab }}>
            <Text style={[styles.subTabLabel, { color: activeTab === tab ? colors.accentPrimary : colors.textSecondary, textTransform: 'capitalize' }]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'convert' && (
          <View>
            {/* Base selector */}
            <View style={styles.baseRow}>
              {BASES.map((b) => (
                <Pressable key={b} onPress={() => { setInputBase(b); setInputValue(''); }} style={[styles.baseBtn, { backgroundColor: inputBase === b ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={b} accessibilityState={{ selected: inputBase === b }}>
                  <Text style={[styles.baseBtnLabel, { color: inputBase === b ? '#FFF' : colors.textSecondary }]}>{b}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Enter ${inputBase} value`}
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="characters"
              style={[styles.mainInput, { color: colors.textPrimary, borderColor: colors.accentPrimary }]}
              accessibilityLabel={`${inputBase} input`}
            />

            {/* Hex letter keys */}
            {inputBase === 'HEX' && (
              <View style={styles.hexKeys}>
                {HEX_KEYS.map((k) => (
                  <Pressable key={k} onPress={() => setInputValue((v) => v + k)} style={[styles.hexKey, { backgroundColor: colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={k}>
                    <Text style={[styles.hexKeyLabel, { color: colors.textPrimary }]}>{k}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Results */}
            {[{ label: 'DEC', val: dec }, { label: 'HEX', val: hex }, { label: 'OCT', val: oct }, { label: 'BIN', val: bin }].map(({ label, val }) => (
              <View key={label} style={[styles.resultRow, { backgroundColor: colors.bgSurface, borderLeftColor: label === inputBase ? colors.accentPrimary : 'transparent' }]}>
                <Text style={[styles.resultBase, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.resultVal, { color: colors.textPrimary }]} numberOfLines={2} selectable>{val}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'bitwise' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Operand A ({inputBase})</Text>
            <TextInput value={bitwiseA} onChangeText={setBitwiseA} placeholder="0" placeholderTextColor={colors.textDisabled} style={[styles.smallInput, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Operand A" />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Operation</Text>
            <View style={styles.opRow}>
              {(['AND', 'OR', 'XOR', 'NOT', 'LSHIFT', 'RSHIFT'] as BitwiseOp[]).map((op) => (
                <Pressable key={op} onPress={() => setBitwiseOp(op)} style={[styles.opBtn, { backgroundColor: bitwiseOp === op ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={op}>
                  <Text style={[styles.opLabel, { color: bitwiseOp === op ? '#FFF' : colors.textSecondary }]}>{op}</Text>
                </Pressable>
              ))}
            </View>
            {bitwiseOp !== 'NOT' && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Operand B ({inputBase})</Text>
                <TextInput value={bitwiseB} onChangeText={setBitwiseB} placeholder="0" placeholderTextColor={colors.textDisabled} style={[styles.smallInput, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Operand B" />
              </>
            )}
            <Pressable onPress={computeBitwise} style={[styles.calcBtn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Compute">
              <Text style={styles.calcBtnLabel}>Compute</Text>
            </Pressable>
            {!!bitwiseResult && (
              <View style={[styles.resultRow, { backgroundColor: colors.bgSurface, borderLeftColor: colors.accentPrimary }]}>
                <Text style={[styles.resultVal, { color: colors.accentPrimary }]} selectable>{bitwiseResult}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'ascii' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Enter a character</Text>
            <TextInput
              value={asciiInput}
              onChangeText={(t) => setAsciiInput(t.slice(-1))}
              maxLength={1}
              style={[styles.mainInput, { color: colors.textPrimary, borderColor: colors.accentPrimary }]}
              accessibilityLabel="ASCII character input"
            />
            {asciiDec !== null && (
              <View>
                <View style={[styles.resultRow, { backgroundColor: colors.bgSurface, borderLeftColor: colors.accentPrimary }]}>
                  <Text style={[styles.resultBase, { color: colors.textSecondary }]}>DEC</Text>
                  <Text style={[styles.resultVal, { color: colors.textPrimary }]}>{asciiDec}</Text>
                </View>
                <View style={[styles.resultRow, { backgroundColor: colors.bgSurface, borderLeftColor: colors.accentPrimary }]}>
                  <Text style={[styles.resultBase, { color: colors.textSecondary }]}>HEX</Text>
                  <Text style={[styles.resultVal, { color: colors.textPrimary }]}>{asciiHex}</Text>
                </View>
                <View style={[styles.resultRow, { backgroundColor: colors.bgSurface, borderLeftColor: colors.accentPrimary }]}>
                  <Text style={[styles.resultBase, { color: colors.textSecondary }]}>BIN</Text>
                  <Text style={[styles.resultVal, { color: colors.textPrimary }]}>{asciiBin}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'color' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hex Color (e.g. #6C63FF)</Text>
            <TextInput
              value={hexColor}
              onChangeText={setHexColor}
              placeholder="#RRGGBB"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="characters"
              style={[styles.mainInput, { color: colors.textPrimary, borderColor: colors.accentPrimary }]}
              accessibilityLabel="Hex color input"
            />
            {rgb && (
              <View>
                <View style={[styles.colorSwatch, { backgroundColor: hexColor.startsWith('#') ? hexColor : `#${hexColor}` }]} />
                <View style={[styles.resultRow, { backgroundColor: colors.bgSurface, borderLeftColor: colors.accentPrimary }]}>
                  <Text style={[styles.resultVal, { color: colors.textPrimary }]} selectable>{hexColorResult}</Text>
                </View>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 6 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  bitBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  bitLabel: { fontSize: 12, fontWeight: '600' },
  subTabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  subTab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  subTabLabel: { fontSize: 13, fontWeight: '600' },
  content: { padding: 16, gap: 12 },
  baseRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  baseBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  baseBtnLabel: { fontSize: 13, fontWeight: '700' },
  mainInput: { fontSize: 24, borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 12, fontFamily: 'monospace' },
  hexKeys: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  hexKey: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  hexKeyLabel: { fontSize: 16, fontWeight: '700' },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, gap: 12 },
  resultBase: { fontSize: 13, fontWeight: '700', width: 36 },
  resultVal: { fontSize: 14, fontFamily: 'monospace', flex: 1 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  smallInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 18, fontFamily: 'monospace' },
  opRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  opLabel: { fontSize: 13, fontWeight: '700' },
  calcBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  calcBtnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  colorSwatch: { width: '100%', height: 80, borderRadius: 16, marginBottom: 12 },
});
