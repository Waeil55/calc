import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { formatResult } from '@/utils/mathEngine';

interface DisplayAreaProps {
  expression: string;
  result: string;
  onLongPressResult?: () => void;
}

export const DisplayArea = React.memo(function DisplayArea({
  expression,
  result,
  onLongPressResult,
}: DisplayAreaProps) {
  const { colors } = useTheme();
  const { precision, thousandsSeparator, numberFormat } = useSettingsStore();

  const displayResult =
    result !== 'Error' && result !== '0' && result !== ''
      ? formatResult(result, precision, thousandsSeparator, numberFormat)
      : result;

  // Announce result for accessibility
  useEffect(() => {
    if (result && result !== '0' && result !== 'Error') {
      AccessibilityInfo.announceForAccessibility(`Result: ${displayResult}`);
    }
  }, [result, displayResult]);

  const resultFontSize = displayResult.length > 12 ? 28 : displayResult.length > 8 ? 40 : 56;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Expression bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.expressionScroll}
        style={styles.expressionContainer}
      >
        <Text
          style={[styles.expression, { color: colors.textSecondary }]}
          accessibilityLabel={`Expression: ${expression}`}
          numberOfLines={1}
        >
          {expression || ' '}
        </Text>
      </ScrollView>

      {/* Result bar */}
      <Pressable
        onLongPress={onLongPressResult}
        accessibilityRole="text"
        accessibilityLabel={`Result: ${displayResult}`}
        accessibilityHint="Long press to copy"
        style={styles.resultContainer}
      >
        <Text
          style={[styles.result, { color: colors.textPrimary, fontSize: resultFontSize }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {displayResult}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  expressionContainer: {
    minHeight: 32,
    marginBottom: 4,
  },
  expressionScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  expression: {
    fontSize: 22,
    fontFamily: 'JetBrainsMono',
    fontWeight: '400',
    textAlign: 'right',
  },
  resultContainer: {
    minHeight: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  result: {
    fontFamily: 'JetBrainsMono',
    fontWeight: '300',
    textAlign: 'right',
  },
});
