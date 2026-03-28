import React, { useCallback, useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';
import { useCalculatorStore } from '@/store/calculatorStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSettingsStore } from '@/store/settingsStore';
import { DisplayArea } from '@/components/calculator/DisplayArea';
import { MemoryBar } from '@/components/calculator/MemoryBar';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { copyToClipboard } from '@/utils/exportUtils';

export function BasicCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const {
    currentExpression,
    currentResult,
    appendToExpression,
    evaluate,
    clear,
    clearEntry,
    backspace,
    toggleNegative,
    insertAnswer,
    setExpression,
  } = useCalculatorStore();

  const addEntry = useHistoryStore((s) => s.addEntry);
  const { autoSave } = useSettingsStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleEquals = useCallback(() => {
    if (!currentExpression.trim()) return;
    evaluate();
    if (autoSave === 'always') {
      addEntry({
        module: 'basic',
        expression: currentExpression,
        result: currentResult,
        resultNumeric: parseFloat(currentResult),
      });
    }
  }, [currentExpression, currentResult, evaluate, addEntry, autoSave]);

  const handleLongPressResult = useCallback(async () => {
    await copyToClipboard(currentResult);
    showToast('Copied to clipboard');
  }, [currentResult]);

  // Swipe left = backspace
  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationX < -50) backspace();
    })
    .runOnJS(true);

  const rows = [
    [
      { label: 'AC', alt: 'CE', variant: 'clear' as const, action: () => clear() },
      { label: '+/−', variant: 'function' as const, action: () => toggleNegative() },
      { label: '%', variant: 'function' as const, action: () => appendToExpression('%') },
      { label: '÷', variant: 'operator' as const, action: () => appendToExpression('÷') },
    ],
    [
      { label: '7', variant: 'digit' as const, action: () => appendToExpression('7') },
      { label: '8', variant: 'digit' as const, action: () => appendToExpression('8') },
      { label: '9', variant: 'digit' as const, action: () => appendToExpression('9') },
      { label: '×', variant: 'operator' as const, action: () => appendToExpression('×') },
    ],
    [
      { label: '4', variant: 'digit' as const, action: () => appendToExpression('4') },
      { label: '5', variant: 'digit' as const, action: () => appendToExpression('5') },
      { label: '6', variant: 'digit' as const, action: () => appendToExpression('6') },
      { label: '−', variant: 'operator' as const, action: () => appendToExpression('-') },
    ],
    [
      { label: '1', variant: 'digit' as const, action: () => appendToExpression('1') },
      { label: '2', variant: 'digit' as const, action: () => appendToExpression('2') },
      { label: '3', variant: 'digit' as const, action: () => appendToExpression('3') },
      { label: '+', variant: 'operator' as const, action: () => appendToExpression('+') },
    ],
    [
      { label: 'ANS', variant: 'function' as const, action: () => insertAnswer(), flex: 1 },
      { label: '0', variant: 'digit' as const, action: () => appendToExpression('0'), flex: 1 },
      { label: '.', variant: 'digit' as const, action: () => appendToExpression('.'), flex: 1 },
      { label: '=', variant: 'equals' as const, action: handleEquals, flex: 1 },
    ],
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      {/* Back button + title */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}
        >
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textSecondary }]}>Basic</Text>
      </View>

      {/* Display */}
      <GestureDetector gesture={swipeGesture}>
        <View>
          <DisplayArea
            expression={currentExpression}
            result={currentResult}
            onLongPressResult={handleLongPressResult}
          />
        </View>
      </GestureDetector>

      {/* Memory bar */}
      <MemoryBar />

      {/* Keypad */}
      <View style={styles.keypad}>
        {/* Parens row */}
        <View style={styles.row}>
          <Button label="(" variant="function" onPress={() => appendToExpression('(')} accessibilityLabel="Open parenthesis" />
          <Button label=")" variant="function" onPress={() => appendToExpression(')')} accessibilityLabel="Close parenthesis" />
          <Button label="⌫" variant="function" onPress={backspace} accessibilityLabel="Backspace" />
          <View style={{ flex: 1 }} />
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn, bi) => (
              <Button
                key={bi}
                label={btn.label}
                variant={btn.variant}
                onPress={btn.action}
                flex={'flex' in btn ? btn.flex : 1}
                accessibilityLabel={btn.label}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  keypad: { flex: 1, paddingHorizontal: 8, paddingBottom: 8 },
  row: { flexDirection: 'row', flex: 1 },
});
