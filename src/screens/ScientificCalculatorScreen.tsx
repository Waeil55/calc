import React, { useCallback, useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useCalculatorStore } from '@/store/calculatorStore';
import { useHistoryStore } from '@/store/historyStore';
import { DisplayArea } from '@/components/calculator/DisplayArea';
import { MemoryBar } from '@/components/calculator/MemoryBar';
import { AngleModeToggle } from '@/components/calculator/AngleModeToggle';
import { SecondFunctionKey } from '@/components/calculator/SecondFunctionKey';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { copyToClipboard } from '@/utils/exportUtils';

type ScientificButton = {
  label: string;
  altLabel?: string;
  variant: 'digit' | 'operator' | 'function' | 'equals' | 'clear';
  action: string; // token to append or special key
};

export function ScientificCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const {
    currentExpression,
    currentResult,
    appendToExpression,
    evaluate,
    clear,
    backspace,
    toggleNegative,
    insertAnswer,
    isSecondFunction,
  } = useCalculatorStore();

  const addEntry = useHistoryStore((s) => s.addEntry);

  const showToast = (msg: string) => { setToastMsg(msg); setToastVisible(true); };

  const append = (token: string) => appendToExpression(token);

  const handleEquals = useCallback(() => {
    if (!currentExpression.trim()) return;
    evaluate();
    addEntry({ module: 'scientific', expression: currentExpression, result: currentResult });
  }, [currentExpression, currentResult, evaluate, addEntry]);

  const handleLongPressResult = useCallback(async () => {
    await copyToClipboard(currentResult);
    showToast('Copied');
  }, [currentResult]);

  // Scientific function rows
  const sciRow1 = [
    { label: 'sin', altLabel: 'sin⁻¹', action: isSecondFunction ? 'asin(' : 'sin(' },
    { label: 'cos', altLabel: 'cos⁻¹', action: isSecondFunction ? 'acos(' : 'cos(' },
    { label: 'tan', altLabel: 'tan⁻¹', action: isSecondFunction ? 'atan(' : 'tan(' },
    { label: 'ln', altLabel: 'eˣ', action: isSecondFunction ? 'e^(' : 'log(' },
    { label: 'log', altLabel: '10ˣ', action: isSecondFunction ? '10^(' : 'log10(' },
  ];

  const sciRow2 = [
    { label: 'x²', altLabel: 'x³', action: isSecondFunction ? '^3' : '^2' },
    { label: '√x', altLabel: '∛x', action: isSecondFunction ? 'cbrt(' : 'sqrt(' },
    { label: 'xⁿ', altLabel: 'ⁿ√x', action: isSecondFunction ? 'nthRoot(' : '^(' },
    { label: 'n!', altLabel: 'C(n,r)', action: isSecondFunction ? 'combinations(' : '!' },
    { label: 'π', altLabel: 'e', action: isSecondFunction ? 'e' : 'pi' },
  ];

  const sciRow3 = [
    { label: 'sinh', altLabel: 'sinh⁻¹', action: isSecondFunction ? 'asinh(' : 'sinh(' },
    { label: 'cosh', altLabel: 'cosh⁻¹', action: isSecondFunction ? 'acosh(' : 'cosh(' },
    { label: 'tanh', altLabel: 'tanh⁻¹', action: isSecondFunction ? 'atanh(' : 'tanh(' },
    { label: 'Abs', altLabel: 'Rnd', action: isSecondFunction ? 'round(' : 'abs(' },
    { label: 'mod', altLabel: 'P(n,r)', action: isSecondFunction ? 'permutations(' : 'mod(' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <AngleModeToggle />
        <SecondFunctionKey />
      </View>

      {/* Display */}
      <DisplayArea
        expression={currentExpression}
        result={currentResult}
        onLongPressResult={handleLongPressResult}
      />

      {/* Memory */}
      <MemoryBar />

      {/* Scientific buttons */}
      <View style={styles.sciButtonsContainer}>
        {[sciRow1, sciRow2, sciRow3].map((row, ri) => (
          <View key={ri} style={styles.sciRow}>
            {row.map((btn, bi) => (
              <Button
                key={bi}
                label={btn.label}
                altLabel={btn.altLabel}
                isAlt={isSecondFunction}
                variant="function"
                onPress={() => append(btn.action)}
                accessibilityLabel={isSecondFunction && btn.altLabel ? btn.altLabel : btn.label}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Main keypad */}
      <View style={styles.keypad}>
        {[
          ['AC', 'clear', () => clear()],
          ['(', 'function', () => append('(')],
          [')', 'function', () => append(')')],
          ['÷', 'operator', () => append('÷')],
          ['7', 'digit', () => append('7')],
          ['8', 'digit', () => append('8')],
          ['9', 'digit', () => append('9')],
          ['×', 'operator', () => append('×')],
          ['4', 'digit', () => append('4')],
          ['5', 'digit', () => append('5')],
          ['6', 'digit', () => append('6')],
          ['−', 'operator', () => append('-')],
          ['1', 'digit', () => append('1')],
          ['2', 'digit', () => append('2')],
          ['3', 'digit', () => append('3')],
          ['+', 'operator', () => append('+')],
          ['+/−', 'function', () => toggleNegative()],
          ['0', 'digit', () => append('0')],
          ['.', 'digit', () => append('.')],
          ['=', 'equals', handleEquals],
        ].reduce<Array<Array<[string, string, () => void]>>>((rows, btn, i) => {
          const ri = Math.floor(i / 4);
          if (!rows[ri]) rows[ri] = [];
          rows[ri].push(btn as [string, string, () => void]);
          return rows;
        }, []).map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map(([label, variant, action]) => (
              <Button
                key={label}
                label={label}
                variant={variant as 'digit' | 'operator' | 'function' | 'equals' | 'clear'}
                onPress={action}
                accessibilityLabel={label}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', flex: 1 },
  backLabel: { fontSize: 17, fontWeight: '500' },
  sciButtonsContainer: { paddingHorizontal: 8 },
  sciRow: { flexDirection: 'row' },
  keypad: { flex: 1, paddingHorizontal: 8, paddingBottom: 8 },
  row: { flexDirection: 'row', flex: 1 },
});
